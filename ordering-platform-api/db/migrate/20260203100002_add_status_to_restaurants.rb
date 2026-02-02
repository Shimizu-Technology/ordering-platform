class AddStatusToRestaurants < ActiveRecord::Migration[8.1]
  def change
    add_column :restaurants, :status, :string, default: "active", null: false
    add_index :restaurants, :status
  end
end
