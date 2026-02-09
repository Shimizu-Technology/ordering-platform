class Order < ApplicationRecord
  include SafeStatusTransitions

  belongs_to :restaurant
  belongs_to :customer, optional: true
  belongs_to :location, optional: true
  has_many :order_items, dependent: :destroy
  has_many :menu_items, through: :order_items
  has_many :refunds, dependent: :destroy

  STATUSES = %w[pending confirmed preparing ready completed cancelled].freeze
  SOURCES = %w[online pos phone].freeze

  # Valid status transitions (from => [to])
  VALID_TRANSITIONS = {
    "pending" => %w[confirmed cancelled],
    "confirmed" => %w[preparing cancelled],
    "preparing" => %w[ready cancelled],
    "ready" => %w[completed],
    "completed" => [],
    "cancelled" => []
  }.freeze

  validates :customer_name, presence: true
  validates :source, inclusion: { in: SOURCES }
  validates :order_type, inclusion: { in: %w[pickup dine_in] }
  validates :status, inclusion: { in: STATUSES }
  validates :idempotency_key, uniqueness: true, allow_nil: true

  scope :active, -> { where.not(status: %w[completed cancelled]) }
  scope :by_status, ->(status) { where(status: status) }

  before_save :calculate_totals
  before_create :generate_idempotency_key

  def calculate_totals
    self.subtotal = order_items.sum { |item| item.subtotal || 0 }
    self.total = subtotal + (tip_amount || 0)
  end

  # Legacy method for compatibility
  def calculate_total
    calculate_totals
  end

  def recalculate!
    order_items.each(&:recalculate!)
    calculate_total
    save!
  end

  # Safe status transitions with validation
  def confirm!
    transition_status!("confirmed", allowed_from: %w[pending])
  end

  def start_preparing!
    transition_status!("preparing", allowed_from: %w[confirmed])
  end

  def mark_ready!
    transition_status!("ready", allowed_from: %w[preparing])
  end

  def complete!
    transition_status!("completed", allowed_from: %w[ready])
  end

  def cancel!
    transition_status!("cancelled", allowed_from: %w[pending confirmed preparing])
  end

  def can_cancel?
    can_transition_to?("cancelled", allowed_from: %w[pending confirmed preparing])
  end

  # === Refund Methods ===

  def refundable_amount
    total - refunded_amount
  end

  def fully_refunded?
    refund_status == "full"
  end

  def partially_refunded?
    refund_status == "partial"
  end

  def can_refund?
    stripe_payment_intent_id.present? && refundable_amount > 0
  end

  def update_refund_status!
    if refunded_amount >= total
      update!(refund_status: "full")
    elsif refunded_amount > 0
      update!(refund_status: "partial")
    else
      update!(refund_status: nil)
    end
  end

  private

  def generate_idempotency_key
    self.idempotency_key ||= "order_#{SecureRandom.uuid}"
  end
end
