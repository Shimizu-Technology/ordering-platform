class AddStripeKeysToRestaurants < ActiveRecord::Migration[8.1]
  def change
    add_column :restaurants, :stripe_publishable_key, :string
    add_column :restaurants, :stripe_secret_key, :string
    add_column :restaurants, :stripe_webhook_secret, :string
  end
end
