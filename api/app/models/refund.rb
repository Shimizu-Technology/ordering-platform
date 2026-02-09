# frozen_string_literal: true

# Tracks refunds processed for orders.
# Supports full and partial refunds via Stripe.
class Refund < ApplicationRecord
  # === Constants ===
  TYPES = %w[full partial].freeze
  STATUSES = %w[pending completed failed].freeze
  REASONS = %w[
    customer_request
    item_unavailable
    quality_issue
    wrong_item
    never_picked_up
    duplicate_charge
    other
  ].freeze

  # === Associations ===
  belongs_to :order
  belongs_to :user, optional: true  # Admin who processed

  # === Validations ===
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :refund_type, presence: true, inclusion: { in: TYPES }
  validates :reason, presence: true, inclusion: { in: REASONS }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :stripe_refund_id, uniqueness: true, allow_nil: true

  validate :amount_not_exceeding_refundable

  # === Scopes ===
  scope :completed, -> { where(status: "completed") }
  scope :failed, -> { where(status: "failed") }
  scope :recent, -> { order(created_at: :desc) }

  # === Callbacks ===
  before_validation :set_stripe_payment_intent_id, on: :create

  # === Instance Methods ===

  def completed?
    status == "completed"
  end

  def failed?
    status == "failed"
  end

  def full?
    refund_type == "full"
  end

  def partial?
    refund_type == "partial"
  end

  def mark_completed!(stripe_refund_id)
    update!(
      status: "completed",
      stripe_refund_id: stripe_refund_id
    )
  end

  def mark_failed!(error_message)
    update!(
      status: "failed",
      error_message: error_message
    )
  end

  private

  def set_stripe_payment_intent_id
    self.stripe_payment_intent_id ||= order&.stripe_payment_intent_id
  end

  def amount_not_exceeding_refundable
    return unless order && amount

    refundable = order.total - order.refunded_amount
    if amount > refundable
      errors.add(:amount, "cannot exceed refundable amount (#{refundable})")
    end
  end
end
