class AddFeaturesToRestaurants < ActiveRecord::Migration[8.1]
  def change
    add_column :restaurants, :features, :jsonb, default: {
      catering: false,
      multi_location: false,
      merchandise: false,
      pos: false,
      rewards: false
    }, null: false
  end
end
