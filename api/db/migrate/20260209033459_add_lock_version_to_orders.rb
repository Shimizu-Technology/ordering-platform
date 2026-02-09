class AddLockVersionToOrders < ActiveRecord::Migration[8.1]
  def change
    # Optimistic locking to prevent concurrent update conflicts
    add_column :orders, :lock_version, :integer, default: 0, null: false

    # Idempotency key for Stripe payments (prevents double-charging)
    add_column :orders, :idempotency_key, :string
    add_index :orders, :idempotency_key, unique: true, where: "idempotency_key IS NOT NULL"
  end
end
