class Location < ApplicationRecord
  belongs_to :restaurant
  has_many :orders, dependent: :nullify

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: { scope: :restaurant_id }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:position) }

  before_validation :generate_slug, on: :create

  private

  def generate_slug
    self.slug ||= name&.parameterize
  end
end
