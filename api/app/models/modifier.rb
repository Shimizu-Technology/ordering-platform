class Modifier < ApplicationRecord
  belongs_to :modifier_group
  has_many :order_item_modifiers, dependent: :restrict_with_error

  validates :name, presence: true
  validates :price_adjustment, numericality: true

  scope :ordered, -> { order(:position) }

  def display_price
    return nil if price_adjustment.zero?
    price_adjustment.positive? ? "+$#{'%.2f' % price_adjustment}" : "-$#{'%.2f' % price_adjustment.abs}"
  end
end
