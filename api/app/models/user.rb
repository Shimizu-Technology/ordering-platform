class User < ApplicationRecord
  belongs_to :restaurant, optional: true

  ROLES = %w[super_admin admin staff].freeze

  validates :clerk_id, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :role, inclusion: { in: ROLES }

  scope :for_restaurant, ->(restaurant) { where(restaurant: restaurant) }
  scope :admins, -> { where(role: %w[super_admin admin]) }
  scope :staff, -> { where(role: "staff") }

  # Role helpers
  def super_admin?
    role == "super_admin"
  end

  def admin?
    role == "admin" || super_admin?
  end

  def staff?
    ROLES.include?(role)
  end

  def full_name
    [ first_name, last_name ].compact.join(" ").presence || email.split("@").first
  end

  # Can this user manage the given restaurant?
  def can_manage?(restaurant)
    super_admin? || self.restaurant_id == restaurant.id
  end

  # Computed attributes for frontend
  def is_admin
    admin?
  end

  def is_staff
    staff?
  end
end
