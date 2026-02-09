class ModifierGroup < ApplicationRecord
  belongs_to :menu_item
  has_many :modifiers, -> { order(:position) }, dependent: :destroy

  validates :name, presence: true
  validates :min_select, numericality: { greater_than_or_equal_to: 0 }
  validates :max_select, numericality: { greater_than: 0 }, allow_nil: true

  scope :ordered, -> { order(:position) }

  def selection_label
    if required? && min_select == 1 && max_select == 1
      "Choose one"
    elsif required?
      "Choose #{min_select}#{max_select ? "-#{max_select}" : "+"}"
    elsif max_select == 1
      "Optional"
    else
      "Choose up to #{max_select || 'any'}"
    end
  end
end
