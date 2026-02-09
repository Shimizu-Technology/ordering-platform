import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Cookie, ShoppingBag, Plus, Minus, X,
  MapPin, Gift, Sparkles
} from 'lucide-react';
import { OptimizedImage } from '@shimizu/shared';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { formatPrice } from '../utils/price';
import { pageTransition, pageTransitionConfig } from '../utils/motion';
import { SectionNav } from '../components/SectionNav';

const IMGIX_DOMAIN = import.meta.env.VITE_IMGIX_DOMAIN;

interface CookieStorePageProps {
  slug: string;
}

interface MerchandiseCategory {
  id: number;
  name: string;
  description: string;
  items: MerchandiseItem[];
}

interface MerchandiseItem {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  starting_price: number;
  has_variants: boolean;
  variant_count: number;
  available: boolean;
}

interface MerchandiseVariant {
  id: number;
  name: string;
  price: number;
  in_stock: boolean;
}

interface ItemDetail {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  variants: MerchandiseVariant[];
}

interface CartItem {
  item: MerchandiseItem;
  variant: MerchandiseVariant;
  quantity: number;
}

export function CookieStorePage({ slug }: CookieStorePageProps) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<MerchandiseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<MerchandiseVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/restaurants/${slug}/merchandise`)
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load products');
        setLoading(false);
      });
  }, [slug]);

  const openItemDetail = async (item: MerchandiseItem) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurants/${slug}/merchandise/${item.id}`);
      const detail = await res.json();
      setSelectedItem(detail);
      setSelectedVariant(detail.variants[0] || null);
      setQuantity(1);
    } catch {
      toast.error('Failed to load product details');
    }
  };

  const addToCart = () => {
    if (!selectedItem || !selectedVariant) return;
    
    const existingIndex = cart.findIndex(
      c => c.item.id === selectedItem.id && c.variant.id === selectedVariant.id
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      // Create a cart-friendly item object
      const cartItem: MerchandiseItem = {
        id: selectedItem.id,
        name: selectedItem.name,
        description: selectedItem.description || '',
        image_url: selectedItem.image_url,
        starting_price: selectedVariant.price,
        has_variants: selectedItem.variants.length > 1,
        variant_count: selectedItem.variants.length,
        available: true
      };
      setCart([...cart, { item: cartItem, variant: selectedVariant, quantity }]);
    }

    toast.success(`Added ${quantity}x ${selectedItem.name} to cart`);
    setSelectedItem(null);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <Cookie className="w-12 h-12 text-amber-600 animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
      {...pageTransition}
      transition={pageTransitionConfig}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-amber-800 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/${slug}`)}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors touch-target"
              aria-label="Back to menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Cookie className="w-5 h-5" />
                Latte Stone Cookies
              </h1>
              <p className="text-xs text-amber-200">Sharing Guam, one cookie at a time</p>
            </div>
          </div>
          
          {/* Cart button */}
          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-amber-800 text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <SectionNav slug={slug} />

      {/* Hero */}
      <div className="px-4 py-6 text-center border-b border-amber-200">
        <div className="flex justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <Gift className="w-5 h-5 text-amber-600" />
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-amber-900 mb-2">
          Authentic Chamorro Shortbread
        </h2>
        <p className="text-sm text-amber-700 max-w-md mx-auto">
          Handcrafted with tropical island flavors. Perfect for gifts, events, or treating yourself.
        </p>
      </div>

      {/* Categories & Products */}
      <div className="px-4 py-6 space-y-8 pb-24">
        {categories.map(category => (
          <section key={category.id}>
            <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-amber-600" />
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-amber-700 mb-4">{category.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {category.items.map(item => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openItemDetail(item)}
                  className="bg-white rounded-xl p-4 text-left shadow-sm border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all"
                >
                  {item.image_url ? (
                    <div className="aspect-square bg-amber-50 rounded-lg mb-3 overflow-hidden">
                      <OptimizedImage
                        src={item.image_url}
                        alt={item.name}
                        context="card"
                        imgixDomain={IMGIX_DOMAIN}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg mb-3 flex items-center justify-center">
                      <Cookie className="w-10 h-10 text-amber-400" />
                    </div>
                  )}
                  <h4 className="font-semibold text-amber-900 text-sm leading-tight mb-1">
                    {item.name}
                  </h4>
                  <p className="text-amber-700 font-medium">
                    {item.has_variants ? 'From ' : ''}{formatPrice(item.starting_price)}
                  </p>
                </motion.button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-t-2xl max-h-[85vh] overflow-auto"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-amber-900">{selectedItem.name}</h3>
                    <p className="text-sm text-amber-700 mt-1">{selectedItem.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 rounded-full hover:bg-amber-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-amber-600" />
                  </button>
                </div>

                {/* Variants */}
                {selectedItem.variants.length > 1 && (
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-amber-900 mb-2 block">
                      Select Size
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedItem.variants.map(variant => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          disabled={!variant.in_stock}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedVariant?.id === variant.id
                              ? 'border-amber-600 bg-amber-50 text-amber-900'
                              : variant.in_stock
                              ? 'border-amber-200 hover:border-amber-400 text-amber-700'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div>{variant.name}</div>
                          <div className="font-bold">{formatPrice(variant.price)}</div>
                          {!variant.in_stock && <div className="text-xs text-red-500">Sold Out</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-amber-900">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-amber-700" />
                    </button>
                    <span className="w-8 text-center font-bold text-amber-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-amber-700" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <Button
                  onClick={addToCart}
                  disabled={!selectedVariant?.in_stock}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                >
                  Add to Cart · {formatPrice((selectedVariant?.price || 0) * quantity)}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sheet */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl"
            >
              <div className="p-4 border-b border-amber-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Your Cart
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 rounded-full hover:bg-amber-100 transition-colors"
                >
                  <X className="w-5 h-5 text-amber-600" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="p-8 text-center text-amber-600">
                  <Cookie className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="p-4 space-y-3 overflow-auto max-h-[60vh]">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-amber-900 text-sm">{item.item.name}</p>
                          <p className="text-xs text-amber-600">{item.variant.name}</p>
                          <p className="text-sm font-medium text-amber-700">
                            {item.quantity} × {formatPrice(item.variant.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="p-2 rounded-full hover:bg-amber-200 transition-colors"
                        >
                          <X className="w-4 h-4 text-amber-600" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-amber-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-amber-900">Total</span>
                      <span className="font-bold text-amber-900 text-lg">{formatPrice(cartTotal)}</span>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg mb-4">
                      <MapPin className="w-4 h-4 text-amber-600 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        <strong>Pickup only</strong> at Three Squares locations. 
                        Online ordering coming soon!
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        toast.info('Cookie checkout coming soon! For now, please call to order.');
                        setShowCart(false);
                      }}
                      className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                    >
                      Checkout · {formatPrice(cartTotal)}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
