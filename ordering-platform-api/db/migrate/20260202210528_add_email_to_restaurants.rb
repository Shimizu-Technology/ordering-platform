class AddEmailToRestaurants < ActiveRecord::Migration[8.1]
  def change
    add_column :restaurants, :email, :string
  end
end
