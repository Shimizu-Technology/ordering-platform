class CreateMerchandiseVariants < ActiveRecord::Migration[8.1]
  def change
    create_table :merchandise_variants do |t|
      t.references :merchandise_item, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :price, precision: 8, scale: 2, null: false
      t.string :sku
      t.integer :position, default: 0, null: false
      t.boolean :available, default: true, null: false

      t.timestamps
    end

    add_index :merchandise_variants, :sku, unique: true, where: "sku IS NOT NULL"
  end
end
