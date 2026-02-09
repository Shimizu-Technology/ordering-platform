class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :customer_name, null: false
      t.string :phone
      t.string :email
      t.string :order_type, default: "pickup", null: false
      t.string :status, default: "pending", null: false
      t.decimal :total, precision: 10, scale: 2, default: 0.0, null: false
      t.string :stripe_payment_intent_id
      t.text :special_instructions
      t.references :restaurant, null: false, foreign_key: true

      t.timestamps
    end

    add_index :orders, :status
    add_index :orders, :stripe_payment_intent_id, unique: true
  end
end
