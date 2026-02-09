class AddTipFieldsToOrders < ActiveRecord::Migration[8.1]
  def change
    add_column :orders, :tip_amount, :decimal, precision: 10, scale: 2, default: 0.0, null: false
    add_column :orders, :tip_percentage, :integer, default: nil
    add_column :orders, :subtotal, :decimal, precision: 10, scale: 2, default: 0.0, null: false
  end
end
