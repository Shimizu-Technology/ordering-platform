class CreateCustomers < ActiveRecord::Migration[8.1]
  def change
    create_table :customers do |t|
      t.references :restaurant, null: false, foreign_key: true
      t.string :name, null: false
      t.string :email, null: false
      t.string :phone

      t.timestamps
    end

    add_index :customers, [ :restaurant_id, :email ], unique: true
  end
end
