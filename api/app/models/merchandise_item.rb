class MerchandiseItem < ApplicationRecord
  belongs_to :merchandise_category
  has_many :merchandise_variants, dependent: :destroy

  validates :name, presence: true

  scope :available, -> { where(available: true) }
  scope :ordered, -> { order(:position) }

  # Convenience method to get restaurant through category
  delegate :restaurant, to: :merchandise_category

  # Returns effective price (base_price if no variants, or nil if variants exist)
  def effective_price
    merchandise_variants.any? ? nil : base_price
  end

  # Returns true if this item has variants (like size options)
  def has_variants?
    merchandise_variants.any?
  end
end
