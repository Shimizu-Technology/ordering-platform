class AddMapUrlToLocations < ActiveRecord::Migration[7.1]
  def change
    add_column :locations, :map_url, :string
  end
end
