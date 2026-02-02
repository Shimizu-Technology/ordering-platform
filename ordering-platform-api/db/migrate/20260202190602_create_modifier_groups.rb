class CreateModifierGroups < ActiveRecord::Migration[8.1]
  def change
    create_table :modifier_groups do |t|
      t.string :name, null: false
      t.boolean :required, default: false, null: false
      t.integer :min_select, default: 0, null: false
      t.integer :max_select
      t.integer :position, default: 0, null: false
      t.references :menu_item, null: false, foreign_key: true

      t.timestamps
    end
  end
end
