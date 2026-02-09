class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :menu_item
  has_many :order_item_modifiers, dependent: :destroy
  has_many :modifiers, through: :order_item_modifiers

  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  before_save :calculate_subtotal

  def calculate_subtotal
    modifier_total = order_item_modifiers.sum(&:price_adjustment)
    self.subtotal = (unit_price + modifier_total) * quantity
  end

  def recalculate!
    self.unit_price = menu_item.base_price
    calculate_subtotal
    save!
  end
end
