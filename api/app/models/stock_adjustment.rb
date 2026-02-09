# frozen_string_literal: true

# Audit log for inventory changes.
# Tracks all stock adjustments with reason and reference.
class StockAdjustment < ApplicationRecord
  # === Associations ===
  belongs_to :adjustable, polymorphic: true
  belongs_to :location, optional: true
  belongs_to :user, optional: true

  # Reference to what caused the adjustment (Order, Refund, etc.)
  belongs_to :reference, polymorphic: true, optional: true

  # === Validations ===
  validates :adjustable_type, inclusion: { in: %w[MenuItem MerchandiseVariant] }
  validates :quantity_before, :quantity_after, :adjustment, presence: true
  validates :reason, presence: true, inclusion: {
    in: %w[order refund manual import cancelled correction]
  }

  # === Scopes ===
  scope :for_item, ->(item) { where(adjustable: item) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_reason, ->(reason) { where(reason: reason) }

  # === Class Methods ===

  # Record a stock adjustment with full context
  def self.record!(adjustable:, adjustment:, reason:, user: nil, reference: nil, location: nil, notes: nil)
    quantity_before = adjustable.stock_quantity || 0
    quantity_after = quantity_before + adjustment

    create!(
      adjustable: adjustable,
      location: location,
      quantity_before: quantity_before,
      quantity_after: quantity_after,
      adjustment: adjustment,
      reason: reason,
      reference: reference,
      user: user,
      notes: notes
    )
  end
end
