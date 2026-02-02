class Restaurant < ApplicationRecord
  has_many :menu_categories, -> { order(:position) }, dependent: :destroy
  has_many :menu_items, through: :menu_categories
  has_many :orders, dependent: :destroy
  has_many :promotions, dependent: :destroy

  STATUSES = %w[setup_pending active suspended].freeze

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true,
            format: { with: /\A[a-z0-9-]+\z/, message: "only allows lowercase letters, numbers, and hyphens" }
  validates :status, inclusion: { in: STATUSES }, allow_nil: true

  scope :active, -> { where(active: true) }

  before_validation :generate_slug, on: :create, if: -> { slug.blank? && name.present? }

  def branding
    {
      primary_color: primary_color,
      secondary_color: secondary_color,
      accent_color: accent_color,
      font_family: font_family,
      logo_url: logo_url
    }
  end

  # Get currently active promotions
  def active_promotions
    promotions.active_promos.select(&:currently_active?)
  end

  def seed_default_categories!
    %w[Beverages Food Specials].each_with_index do |name, i|
      menu_categories.find_or_create_by!(name: name) do |cat|
        cat.position = i
      end
    end
  end

  private

  def generate_slug
    base = name.parameterize
    candidate = base
    counter = 1

    while Restaurant.where(slug: candidate).where.not(id: id).exists?
      candidate = "#{base}-#{counter}"
      counter += 1
    end

    self.slug = candidate
  end
end
