class CreateRestaurants < ActiveRecord::Migration[8.1]
  def change
    create_table :restaurants do |t|
      t.string :name
      t.string :slug
      t.string :logo_url
      t.string :phone
      t.string :address
      t.text :description
      t.jsonb :hours
      t.string :stripe_account_id
      t.string :primary_color
      t.string :secondary_color
      t.string :accent_color
      t.string :font_family
      t.boolean :active, default: true, null: false
      t.string :subdomain
      t.jsonb :default_order_type, default: "pickup"

      t.timestamps
    end
    add_index :restaurants, :slug, unique: true
  end
end
