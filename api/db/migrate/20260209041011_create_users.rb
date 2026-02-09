class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :clerk_id, null: false
      t.string :email, null: false
      t.string :first_name
      t.string :last_name
      t.string :role, default: "staff", null: false
      # Restaurant is optional - super admins might manage multiple
      t.references :restaurant, null: true, foreign_key: true

      t.timestamps
    end

    add_index :users, :clerk_id, unique: true
    add_index :users, :email, unique: true
    add_index :users, [ :restaurant_id, :role ]
  end
end
