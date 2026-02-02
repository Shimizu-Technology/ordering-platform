class Restaurant < ApplicationRecord
  has_many :menu_categories, -> { order(:position) }, dependent: :destroy
  has_many :menu_items, through: :menu_categories
  has_many :orders, dependent: :destroy

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true,
            format: { with: /\A[a-z0-9-]+\z/, message: "only allows lowercase letters, numbers, and hyphens" }

  scope :active, -> { where(active: true) }

  def branding
    {
      primary_color: primary_color,
      secondary_color: secondary_color,
      accent_color: accent_color,
      font_family: font_family,
      logo_url: logo_url
    }
  end
end
