# frozen_string_literal: true

# Provides inventory tracking functionality for models.
# Include in MenuItem and MerchandiseVariant.
#
# Required columns:
#   - track_inventory: boolean
#   - stock_quantity: integer
#   - low_stock_threshold: integer
module TrackableInventory
  extend ActiveSupport::Concern

  included do
    has_many :stock_adjustments, as: :adjustable, dependent: :destroy

    scope :tracking_inventory, -> { where(track_inventory: true) }
    scope :in_stock, -> { where("track_inventory = false OR stock_quantity > 0") }
    scope :out_of_stock, -> { where(track_inventory: true, stock_quantity: 0) }
    scope :low_stock, -> { where("track_inventory = true AND stock_quantity <= low_stock_threshold AND stock_quantity > 0") }
  end

  # === Stock Status ===

  def in_stock?
    !track_inventory || (stock_quantity.present? && stock_quantity > 0)
  end

  def out_of_stock?
    track_inventory && (stock_quantity.nil? || stock_quantity <= 0)
  end

  def low_stock?
    track_inventory &&
      stock_quantity.present? &&
      low_stock_threshold.present? &&
      stock_quantity <= low_stock_threshold &&
      stock_quantity > 0
  end

  def stock_status
    return nil unless track_inventory

    if out_of_stock?
      "sold_out"
    elsif low_stock?
      "low_stock"
    else
      "in_stock"
    end
  end

  # === Stock Operations ===

  # Decrement stock for an order
  # Uses row-level locking to prevent race conditions
  # Returns true if successful, false if insufficient stock
  def decrement_stock!(quantity, order: nil, user: nil)
    return true unless track_inventory

    with_lock do
      current = stock_quantity || 0

      if current < quantity
        return false  # Insufficient stock
      end

      new_quantity = current - quantity

      StockAdjustment.record!(
        adjustable: self,
        adjustment: -quantity,
        reason: "order",
        reference: order,
        user: user,
        notes: order ? "Order ##{order.id}" : nil
      )

      update!(stock_quantity: new_quantity)
      true
    end
  end

  # Restore stock (e.g., for refunds or cancelled orders)
  def restore_stock!(quantity, reason:, reference: nil, user: nil, notes: nil)
    return true unless track_inventory

    with_lock do
      current = stock_quantity || 0
      new_quantity = current + quantity

      StockAdjustment.record!(
        adjustable: self,
        adjustment: quantity,
        reason: reason,
        reference: reference,
        user: user,
        notes: notes
      )

      update!(stock_quantity: new_quantity)
      true
    end
  end

  # Manual stock adjustment (for admin)
  def adjust_stock!(new_quantity, reason: "manual", user: nil, notes: nil)
    with_lock do
      current = stock_quantity || 0
      adjustment = new_quantity - current

      StockAdjustment.record!(
        adjustable: self,
        adjustment: adjustment,
        reason: reason,
        user: user,
        notes: notes
      )

      update!(stock_quantity: new_quantity)
      true
    end
  end

  # Check if we can fulfill the requested quantity
  def can_fulfill?(quantity)
    return true unless track_inventory

    (stock_quantity || 0) >= quantity
  end
end
