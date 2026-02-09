# frozen_string_literal: true

# Handles inventory operations for orders.
# Decrements stock on order, restores on cancel/refund.
class InventoryService
  class InsufficientStockError < StandardError
    attr_reader :item, :requested, :available

    def initialize(item, requested, available)
      @item = item
      @requested = requested
      @available = available
      super("Insufficient stock for #{item.name}: requested #{requested}, available #{available}")
    end
  end

  class << self
    # Check if all items in an order can be fulfilled
    def can_fulfill?(order)
      order.order_items.includes(:menu_item).all? do |order_item|
        menu_item = order_item.menu_item
        !menu_item.track_inventory || menu_item.can_fulfill?(order_item.quantity)
      end
    end

    # Verify stock and raise error if insufficient
    def verify_stock!(order)
      order.order_items.includes(:menu_item).each do |order_item|
        menu_item = order_item.menu_item
        next unless menu_item.track_inventory

        unless menu_item.can_fulfill?(order_item.quantity)
          raise InsufficientStockError.new(
            menu_item,
            order_item.quantity,
            menu_item.stock_quantity || 0
          )
        end
      end
      true
    end

    # Decrement stock for all items in an order
    def decrement_for_order!(order, user: nil)
      order.order_items.includes(:menu_item).each do |order_item|
        menu_item = order_item.menu_item
        next unless menu_item.track_inventory

        success = menu_item.decrement_stock!(
          order_item.quantity,
          order: order,
          user: user
        )

        unless success
          raise InsufficientStockError.new(
            menu_item,
            order_item.quantity,
            menu_item.stock_quantity || 0
          )
        end
      end
    end

    # Restore stock for all items in an order (refund/cancel)
    def restore_for_order!(order, reason: "cancelled", user: nil)
      order.order_items.includes(:menu_item).each do |order_item|
        menu_item = order_item.menu_item
        next unless menu_item.track_inventory

        menu_item.restore_stock!(
          order_item.quantity,
          reason: reason,
          reference: order,
          user: user,
          notes: "#{reason.titleize} Order ##{order.id}"
        )
      end
    end

    # Get low stock items for a restaurant
    def low_stock_items(restaurant)
      MenuItem
        .joins(:menu_category)
        .where(menu_categories: { restaurant_id: restaurant.id })
        .tracking_inventory
        .low_stock
    end

    # Get out of stock items for a restaurant
    def out_of_stock_items(restaurant)
      MenuItem
        .joins(:menu_category)
        .where(menu_categories: { restaurant_id: restaurant.id })
        .tracking_inventory
        .out_of_stock
    end
  end
end
