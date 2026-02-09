class OrderItemModifier < ApplicationRecord
  belongs_to :order_item
  belongs_to :modifier

  validates :price_adjustment, numericality: true

  before_validation :set_price_from_modifier

  private

  def set_price_from_modifier
    self.price_adjustment ||= modifier&.price_adjustment || 0
  end
end
