class CreateMerchandiseCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :merchandise_categories do |t|
      t.references :restaurant, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.integer :position, default: 0, null: false
      t.boolean :active, default: true, null: false

      t.timestamps
    end
  end
end
