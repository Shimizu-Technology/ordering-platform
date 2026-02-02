class CreateMenuItems < ActiveRecord::Migration[8.1]
  def change
    create_table :menu_items do |t|
      t.string :name, null: false
      t.text :description
      t.decimal :base_price, precision: 8, scale: 2, null: false
      t.string :image_url
      t.boolean :available, default: true, null: false
      t.integer :position, default: 0, null: false
      t.references :menu_category, null: false, foreign_key: true

      t.timestamps
    end
  end
end
