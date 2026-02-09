class CreatePromotions < ActiveRecord::Migration[8.1]
  def change
    create_table :promotions do |t|
      t.references :restaurant, null: false, foreign_key: true
      t.string :name, null: false
      t.string :promotion_type, null: false # percentage_off, fixed_off, bogo, happy_hour_price
      t.decimal :value, precision: 8, scale: 2, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.jsonb :days_of_week, default: [], null: false # e.g. ["wednesday", "thursday"]
      t.boolean :active, default: true, null: false
      t.string :applies_to, default: "all", null: false # "all", "category", "item"
      t.bigint :applies_to_id # category or item ID when applies_to is not "all"

      t.timestamps
    end

    add_index :promotions, [ :restaurant_id, :active ]
    add_index :promotions, :applies_to
  end
end
