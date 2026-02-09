import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote,
  User, ChefHat, X, Check, AlertCircle, Search, ArrowLeft
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { adminApi } from '../../api/adminClient';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  base_price: number;
  category_id: number;
  available: boolean;
  image_url: string | null;
  modifier_groups: ModifierGroup[];
}

interface ModifierGroup {
  id: number;
  name: string;
  required: boolean;
  min_selections: number;
  max_selections: number;
  modifiers: Modifier[];
}

interface Modifier {
  id: number;
  name: string;
  price_adjustment: number;
}

interface Category {
  id: number;
  name: string;
  items: MenuItem[];
}

interface CartItem {
  id: string; // unique cart id
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: Modifier[];
  specialInstructions?: string;
}

const RESTAURANT_SLUG = 'havajava';

interface POSPageProps {
  onBack?: () => void;
}

export function POSPage({ onBack }: POSPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('Walk-in');
  const [orderType, setOrderType] = useState<'pickup' | 'dine_in'>('dine_in');
  const [showModifierModal, setShowModifierModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [tempModifiers, setTempModifiers] = useState<Modifier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch menu on mount
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/v1/restaurants/${RESTAURANT_SLUG}/menu`);
      const data = await response.json();
      setCategories(data.categories || []);
      if (data.categories?.length > 0) {
        setActiveCategory(data.categories[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (!item.available) {
      toast.error(`${item.name} is currently unavailable`);
      return;
    }

    // If item has modifiers, show modal
    if (item.modifier_groups?.length > 0) {
      setSelectedItem(item);
      setTempModifiers([]);
      setShowModifierModal(true);
    } else {
      // Add directly to cart
      addToCart(item, []);
    }
  };

  const addToCart = (item: MenuItem, modifiers: Modifier[]) => {
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity: 1,
      selectedModifiers: modifiers,
    };
    setCart(prev => [...prev, cartItem]);
    toast.success(`Added ${item.name}`);
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === cartId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('Walk-in');
  };

  const calculateItemTotal = (item: CartItem): number => {
    const modifierTotal = item.selectedModifiers.reduce((sum, m) => sum + m.price_adjustment, 0);
    return (item.menuItem.base_price + modifierTotal) * item.quantity;
  };

  const cartTotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const handleConfirmModifiers = () => {
    if (selectedItem) {
      addToCart(selectedItem, tempModifiers);
      setShowModifierModal(false);
      setSelectedItem(null);
      setTempModifiers([]);
    }
  };

  const toggleModifier = (modifier: Modifier, group: ModifierGroup) => {
    setTempModifiers(prev => {
      const hasModifier = prev.some(m => m.id === modifier.id);
      if (hasModifier) {
        return prev.filter(m => m.id !== modifier.id);
      }
      
      // Check max selections for group
      const groupModifierCount = prev.filter(m => 
        group.modifiers.some(gm => gm.id === m.id)
      ).length;
      
      if (group.max_selections && groupModifierCount >= group.max_selections) {
        // Replace the last selected one in this group
        const otherGroupModifiers = prev.filter(m => 
          !group.modifiers.some(gm => gm.id === m.id)
        );
        return [...otherGroupModifiers, modifier];
      }
      
      return [...prev, modifier];
    });
  };

  const submitOrder = async (paymentMethod: 'counter' | 'card') => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        order: {
          customer_name: customerName || 'Walk-in',
          order_type: orderType,
          source: 'pos',
          items: cart.map(item => ({
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            special_instructions: item.specialInstructions,
            modifier_ids: item.selectedModifiers.map(m => m.id),
          })),
        },
      };

      const response = await fetch(`/api/v1/restaurants/${RESTAURANT_SLUG}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const order = await response.json();

      // If pay at counter, auto-confirm the order
      if (paymentMethod === 'counter') {
        await adminApi.updateOrderStatus(order.id, 'confirmed');
        toast.success(`Order #${order.id} created - Pay at counter`);
      } else {
        toast.success(`Order #${order.id} created`);
      }

      clearCart();
    } catch (error) {
      console.error('Failed to submit order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter items by search
  const getFilteredItems = useCallback(() => {
    if (!searchQuery.trim()) {
      return categories.find(c => c.id === activeCategory)?.items || [];
    }
    const query = searchQuery.toLowerCase();
    return categories.flatMap(c => c.items).filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  }, [categories, activeCategory, searchQuery]);

  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="text-text-secondary">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-surface overflow-hidden">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-brand text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors -ml-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <ChefHat className="w-6 h-6" />
            <h1 className="text-lg font-semibold">POS Mode</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </header>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="flex gap-1 p-2 bg-surface-elevated overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-brand text-white'
                    : 'bg-white text-text-secondary hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredItems.map((item) => (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleItemClick(item)}
                disabled={!item.available}
                className={`p-4 rounded-xl text-left transition-all ${
                  item.available
                    ? 'bg-white hover:shadow-md hover:border-brand border-2 border-transparent'
                    : 'bg-gray-100 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="font-medium text-text-primary line-clamp-2 mb-1">
                  {item.name}
                </div>
                <div className="text-brand font-semibold">
                  ${item.base_price.toFixed(2)}
                </div>
                {!item.available && (
                  <span className="text-xs text-red-500 mt-1">Sold Out</span>
                )}
              </motion.button>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-text-muted">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-white border-l border-border-default flex flex-col">
        {/* Customer Info */}
        <div className="p-4 border-b border-border-default">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="flex-1 px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                orderType === 'dine_in'
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-text-secondary'
              }`}
            >
              Dine In
            </button>
            <button
              onClick={() => setOrderType('pickup')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                orderType === 'pickup'
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-text-secondary'
              }`}
            >
              Pickup
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs">Tap items to add</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-surface-elevated rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text-primary truncate">
                          {item.menuItem.name}
                        </div>
                        {item.selectedModifiers.length > 0 && (
                          <div className="text-xs text-text-muted mt-0.5">
                            {item.selectedModifiers.map(m => m.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-2">
                        <div className="font-semibold text-brand">
                          ${calculateItemTotal(item).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full bg-white border border-border-default flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-white border border-border-default flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 border-t border-border-default bg-surface-elevated">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-secondary">Total</span>
            <span className="text-2xl font-bold text-text-primary">
              ${cartTotal.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => submitOrder('counter')}
              disabled={cart.length === 0 || submitting}
              className="flex items-center justify-center gap-2 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Banknote className="w-5 h-5" />
              Pay at Counter
            </button>
            <button
              onClick={() => submitOrder('card')}
              disabled={cart.length === 0 || submitting}
              className="flex items-center justify-center gap-2 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              Card
            </button>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="w-full py-2 text-text-muted text-sm hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {/* Modifier Modal */}
      <AnimatePresence>
        {showModifierModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModifierModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-border-default flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                  <p className="text-brand font-medium">${selectedItem.base_price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setShowModifierModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {selectedItem.modifier_groups?.map((group) => (
                  <div key={group.id} className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-text-primary">{group.name}</h4>
                      {group.required && (
                        <span className="text-xs text-red-500">Required</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {group.modifiers.map((modifier) => {
                        const isSelected = tempModifiers.some(m => m.id === modifier.id);
                        return (
                          <button
                            key={modifier.id}
                            onClick={() => toggleModifier(modifier, group)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                              isSelected
                                ? 'border-brand bg-brand/5'
                                : 'border-border-default hover:border-brand/50'
                            }`}
                          >
                            <span className="text-text-primary">{modifier.name}</span>
                            <div className="flex items-center gap-2">
                              {modifier.price_adjustment > 0 && (
                                <span className="text-text-secondary text-sm">
                                  +${modifier.price_adjustment.toFixed(2)}
                                </span>
                              )}
                              {isSelected && (
                                <Check className="w-5 h-5 text-brand" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border-default">
                <button
                  onClick={handleConfirmModifiers}
                  className="w-full py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-hover transition-colors"
                >
                  Add to Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
