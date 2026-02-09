class CreateOrderItemModifiers < ActiveRecord::Migration[8.1]
  def change
    create_table :order_item_modifiers do |t|
      t.references :order_item, null: false, foreign_key: true
      t.references :modifier, null: false, foreign_key: true
      t.decimal :price_adjustment, precision: 8, scale: 2, default: 0.0, null: false

      t.timestamps
    end
  end
end
