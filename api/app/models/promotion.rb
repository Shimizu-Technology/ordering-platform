class Promotion < ApplicationRecord
  belongs_to :restaurant

  TYPES = %w[percentage_off fixed_off bogo happy_hour_price].freeze
  APPLIES_TO_OPTIONS = %w[all category item].freeze
  DAYS = %w[sunday monday tuesday wednesday thursday friday saturday].freeze

  validates :name, presence: true
  validates :promotion_type, presence: true, inclusion: { in: TYPES }
  validates :value, presence: true, numericality: { greater_than: 0 }
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :applies_to, presence: true, inclusion: { in: APPLIES_TO_OPTIONS }
  validates :days_of_week, presence: true
  validate :valid_days_of_week

  scope :active_promos, -> { where(active: true) }

  # Check if this promotion is currently active (right now)
  def currently_active?
    return false unless active?

    now = Time.current
    current_day = now.strftime("%A").downcase

    return false unless days_of_week.include?(current_day)

    current_time = now.strftime("%H:%M:%S")
    start_str = start_time.strftime("%H:%M:%S")
    end_str = end_time.strftime("%H:%M:%S")

    current_time >= start_str && current_time <= end_str
  end

  # Calculate discounted price for a given base_price
  def discounted_price(base_price)
    case promotion_type
    when "percentage_off"
      (base_price * (1 - value / 100.0)).round(2)
    when "fixed_off"
      [ (base_price - value), 0 ].max.round(2)
    when "happy_hour_price"
      value.to_f
    when "bogo"
      base_price # BOGO doesn't change individual item price
    else
      base_price
    end
  end

  # Does this promotion apply to a specific menu item?
  def applies_to_item?(menu_item)
    case applies_to
    when "all"
      true
    when "category"
      menu_item.menu_category_id == applies_to_id
    when "item"
      menu_item.id == applies_to_id
    else
      false
    end
  end

  private

  def valid_days_of_week
    return if days_of_week.blank?

    invalid = days_of_week - DAYS
    if invalid.any?
      errors.add(:days_of_week, "contains invalid days: #{invalid.join(', ')}")
    end
  end
end
