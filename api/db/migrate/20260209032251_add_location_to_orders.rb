class AddLocationToOrders < ActiveRecord::Migration[8.1]
  def change
    # Nullable because not all restaurants have multi-location (e.g., HavaJava)
    add_reference :orders, :location, null: true, foreign_key: true
  end
end
