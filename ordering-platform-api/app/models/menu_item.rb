class MenuItem < ApplicationRecord
  belongs_to :menu_category
  has_many :modifier_groups, -> { order(:position) }, dependent: :destroy
  has_many :modifiers, through: :modifier_groups
  has_many :order_items, dependent: :restrict_with_error

  validates :name, presence: true
  validates :base_price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :available, -> { where(available: true) }
  scope :ordered, -> { order(:position) }

  delegate :restaurant, to: :menu_category
end
