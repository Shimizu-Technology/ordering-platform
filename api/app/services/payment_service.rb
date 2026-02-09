# frozen_string_literal: true

# Handles Stripe payment operations with race condition protection.
#
# Key protections:
# 1. Idempotency keys prevent double-charging on retries
# 2. Database transactions ensure atomic order + payment updates
# 3. Webhook handling is idempotent (processes each event once)
class PaymentService
  class PaymentError < StandardError; end
  class AlreadyProcessedError < StandardError; end

  def initialize(order)
    @order = order
    @restaurant = order.restaurant
  end

  # Create a PaymentIntent for the order
  # Uses order's idempotency_key to prevent duplicate charges
  def create_payment_intent
    validate_can_process!

    Stripe::PaymentIntent.create(
      {
        amount: amount_in_cents,
        currency: "usd",
        metadata: {
          order_id: @order.id,
          restaurant_id: @restaurant.id,
          restaurant_slug: @restaurant.slug
        },
        # Capture payment immediately (not just authorize)
        capture_method: "automatic"
      },
      {
        # Idempotency key ensures this exact charge isn't duplicated
        idempotency_key: @order.idempotency_key,
        # Use restaurant's Stripe keys if available, otherwise platform keys
        api_key: stripe_secret_key
      }
    )
  end

  # Confirm payment was successful and update order
  # Called from webhook handler
  def confirm_payment(payment_intent_id)
    Order.transaction do
      @order.reload(lock: true)

      # Already processed? Skip (idempotent)
      return if @order.stripe_payment_intent_id == payment_intent_id && @order.status != "pending"

      @order.update!(
        stripe_payment_intent_id: payment_intent_id,
        status: "confirmed"
      )
    end
  end

  # Handle payment failure
  def handle_failure(payment_intent_id, error_message)
    Order.transaction do
      @order.reload(lock: true)

      # Don't overwrite a successful status
      return if %w[confirmed preparing ready completed].include?(@order.status)

      @order.update!(
        stripe_payment_intent_id: payment_intent_id,
        status: "cancelled"
      )
      # Could also store error_message in a notes field
    end
  end

  private

  def validate_can_process!
    raise PaymentError, "Order has no items" if @order.order_items.empty?
    raise PaymentError, "Order total is zero" if @order.total.zero?
    raise AlreadyProcessedError, "Order already paid" if @order.stripe_payment_intent_id.present?
  end

  def amount_in_cents
    (@order.total * 100).to_i
  end

  def stripe_secret_key
    # Use restaurant's own Stripe key if configured, otherwise fall back to platform
    @restaurant.stripe_secret_key.presence || Rails.application.credentials.dig(:stripe, :secret_key)
  end
end
