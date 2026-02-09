class MerchandiseCategory < ApplicationRecord
  belongs_to :restaurant
  has_many :merchandise_items, dependent: :destroy

  validates :name, presence: true

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:position) }
end
