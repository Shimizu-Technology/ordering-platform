class CreateLocations < ActiveRecord::Migration[8.1]
  def change
    create_table :locations do |t|
      t.references :restaurant, null: false, foreign_key: true
      t.string :name, null: false
      t.string :slug, null: false
      t.string :address
      t.string :phone
      t.string :email
      t.jsonb :hours, default: {}
      t.boolean :active, default: true, null: false
      t.integer :position, default: 0, null: false

      t.timestamps
    end

    add_index :locations, [ :restaurant_id, :slug ], unique: true
  end
end
