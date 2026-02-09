class AddSourceToOrders < ActiveRecord::Migration[8.1]
  def change
    add_column :orders, :source, :string, default: 'online', null: false
    add_index :orders, :source
  end
end
