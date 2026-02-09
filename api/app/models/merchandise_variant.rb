class MerchandiseVariant < ApplicationRecord
  belongs_to :merchandise_item

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :sku, uniqueness: true, allow_nil: true

  scope :available, -> { where(available: true) }
  scope :ordered, -> { order(:position) }

  # Convenience method to get category and restaurant
  delegate :merchandise_category, :restaurant, to: :merchandise_item
end
