class AddPrepTimeToRestaurants < ActiveRecord::Migration[8.1]
  def change
    add_column :restaurants, :default_prep_time_minutes, :integer, default: 10, null: false
  end
end
