class CreateStockAdjustments < ActiveRecord::Migration[8.0]
  def change
    create_table :stock_adjustments do |t|
      # Polymorphic association to MenuItem or MerchandiseVariant
      t.string :adjustable_type, null: false
      t.bigint :adjustable_id, null: false

      # Optional location scoping (for multi-location)
      t.references :location, foreign_key: true

      # Stock change details
      t.integer :quantity_before, null: false
      t.integer :quantity_after, null: false
      t.integer :adjustment, null: false  # positive or negative

      # Reason for adjustment
      t.string :reason, null: false  # 'order', 'refund', 'manual', 'import', 'cancelled'

      # Reference to what caused this (Order, Refund, etc.)
      t.string :reference_type
      t.bigint :reference_id

      # Who made the change (null for system/automated)
      t.references :user, foreign_key: true

      # Optional notes
      t.text :notes

      t.timestamps
    end

    add_index :stock_adjustments, [ :adjustable_type, :adjustable_id ], name: 'idx_stock_adj_adjustable'
    add_index :stock_adjustments, [ :reference_type, :reference_id ], name: 'idx_stock_adj_reference'
    add_index :stock_adjustments, :reason
    add_index :stock_adjustments, :created_at
  end
end
