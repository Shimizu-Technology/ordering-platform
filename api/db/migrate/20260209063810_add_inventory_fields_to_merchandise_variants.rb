class AddInventoryFieldsToMerchandiseVariants < ActiveRecord::Migration[8.0]
  def change
    add_column :merchandise_variants, :track_inventory, :boolean, default: true, null: false
    add_column :merchandise_variants, :stock_quantity, :integer, default: 0, null: false
    add_column :merchandise_variants, :low_stock_threshold, :integer, default: 5
  end
end
