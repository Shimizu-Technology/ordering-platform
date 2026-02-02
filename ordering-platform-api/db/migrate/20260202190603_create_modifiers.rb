class CreateModifiers < ActiveRecord::Migration[8.1]
  def change
    create_table :modifiers do |t|
      t.string :name, null: false
      t.decimal :price_adjustment, precision: 8, scale: 2, default: 0.0, null: false
      t.boolean :default_selected, default: false, null: false
      t.integer :position, default: 0, null: false
      t.references :modifier_group, null: false, foreign_key: true

      t.timestamps
    end
  end
end
