class Order < ApplicationRecord
  belongs_to :restaurant
  belongs_to :customer, optional: true
  belongs_to :location, optional: true
  has_many :order_items, dependent: :destroy
  has_many :menu_items, through: :order_items

  validates :customer_name, presence: true
  validates :order_type, inclusion: { in: %w[pickup dine_in] }
  validates :status, inclusion: { in: %w[pending confirmed preparing ready completed cancelled] }

  scope :active, -> { where.not(status: %w[completed cancelled]) }
  scope :by_status, ->(status) { where(status: status) }

  before_save :calculate_total

  def calculate_total
    self.total = order_items.sum { |item| item.subtotal || 0 }
  end

  def recalculate!
    order_items.each(&:recalculate!)
    calculate_total
    save!
  end
end
