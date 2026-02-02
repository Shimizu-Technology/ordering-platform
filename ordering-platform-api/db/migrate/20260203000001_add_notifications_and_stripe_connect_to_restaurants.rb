class AddNotificationsAndStripeConnectToRestaurants < ActiveRecord::Migration[8.1]
  def change
    # ORD-15: Notification settings
    add_column :restaurants, :notifications_enabled, :boolean, default: false, null: false
    add_column :restaurants, :webhook_url, :string

    # ORD-16: Stripe Connect
    # stripe_account_id already exists on restaurants table
    add_column :restaurants, :stripe_onboarding_complete, :boolean, default: false, null: false
  end
end
