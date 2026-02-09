class CreateMerchandiseItems < ActiveRecord::Migration[8.1]
  def change
    create_table :merchandise_items do |t|
      t.references :merchandise_category, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.decimal :base_price, precision: 8, scale: 2
      t.string :image_url
      t.integer :position, default: 0, null: false
      t.boolean :available, default: true, null: false

      t.timestamps
    end
  end
end
