class StripeConnectService
  def self.configured?
    ENV["STRIPE_SECRET_KEY"].present?
  end

  def self.create_account(restaurant, return_url:, refresh_url:)
    unless configured?
      return { success: false, error: "Stripe not configured" }
    end

    Stripe.api_key = ENV["STRIPE_SECRET_KEY"]

    begin
      # Create a Standard Connect account
      account = Stripe::Account.create(
        type: "standard",
        country: "US",
        email: restaurant.email,
        business_profile: {
          name: restaurant.name,
          url: restaurant.slug
        }
      )

      restaurant.update!(stripe_account_id: account.id, stripe_onboarding_complete: false)

      # Create an account link for onboarding
      account_link = Stripe::AccountLink.create(
        account: account.id,
        refresh_url: refresh_url,
        return_url: return_url,
        type: "account_onboarding"
      )

      { success: true, url: account_link.url, account_id: account.id }
    rescue Stripe::StripeError => e
      { success: false, error: e.message }
    end
  end

  def self.check_status(restaurant)
    unless configured?
      return { configured: false, connected: false, onboarding_complete: false }
    end

    unless restaurant.stripe_account_id.present?
      return { configured: true, connected: false, onboarding_complete: false }
    end

    Stripe.api_key = ENV["STRIPE_SECRET_KEY"]

    begin
      account = Stripe::Account.retrieve(restaurant.stripe_account_id)
      complete = account.charges_enabled && account.payouts_enabled

      # Persist status if it changed
      if complete != restaurant.stripe_onboarding_complete
        restaurant.update!(stripe_onboarding_complete: complete)
      end

      {
        configured: true,
        connected: true,
        onboarding_complete: complete,
        account_id: restaurant.stripe_account_id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled
      }
    rescue Stripe::StripeError => e
      { configured: true, connected: true, onboarding_complete: false, error: e.message }
    end
  end

  def self.platform_fee_percent
    ENV.fetch("STRIPE_PLATFORM_FEE_PERCENT", "5").to_f
  end
end
