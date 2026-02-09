class AddInventoryFieldsToMenuItems < ActiveRecord::Migration[8.0]
  def change
    add_column :menu_items, :track_inventory, :boolean, default: false, null: false
    add_column :menu_items, :stock_quantity, :integer
    add_column :menu_items, :low_stock_threshold, :integer, default: 5
  end
end
