class CreateRefunds < ActiveRecord::Migration[8.0]
  def change
    create_table :refunds do |t|
      t.references :order, null: false, foreign_key: true
      t.references :user, foreign_key: true  # Admin who processed

      # Amounts
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :refund_type, null: false  # 'full', 'partial'

      # Stripe
      t.string :stripe_refund_id
      t.string :stripe_payment_intent_id

      # Details
      t.string :reason, null: false  # 'customer_request', 'item_unavailable', etc.
      t.text :notes

      # Inventory
      t.boolean :restore_inventory, default: true, null: false

      # Status
      t.string :status, default: 'pending', null: false  # 'pending', 'completed', 'failed'
      t.text :error_message

      t.timestamps
    end

    add_index :refunds, :stripe_refund_id, unique: true
    add_index :refunds, :status
    add_index :refunds, :created_at

    # Add refund tracking to orders
    add_column :orders, :refunded_amount, :decimal, precision: 10, scale: 2, default: 0, null: false
    add_column :orders, :refund_status, :string  # nil, 'partial', 'full'
  end
end
