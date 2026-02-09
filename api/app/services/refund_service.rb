# frozen_string_literal: true

# Handles refund processing via Stripe.
# Supports full and partial refunds with optional inventory restoration.
class RefundService
  class RefundError < StandardError; end

  def initialize(order, admin_user = nil)
    @order = order
    @admin = admin_user
  end

  # Process a full refund for the remaining balance
  def full_refund!(reason:, notes: nil)
    amount = @order.refundable_amount

    raise RefundError, "Order has no refundable amount" if amount <= 0
    raise RefundError, "Order has no payment to refund" unless @order.stripe_payment_intent_id.present?

    process_refund(
      amount: amount,
      refund_type: "full",
      reason: reason,
      notes: notes,
      restore_inventory: true
    )
  end

  # Process a partial refund for a specific amount
  def partial_refund!(amount:, reason:, notes: nil, restore_inventory: false)
    raise RefundError, "Amount must be positive" if amount <= 0
    raise RefundError, "Amount exceeds refundable amount (#{@order.refundable_amount})" if amount > @order.refundable_amount
    raise RefundError, "Order has no payment to refund" unless @order.stripe_payment_intent_id.present?

    process_refund(
      amount: amount,
      refund_type: "partial",
      reason: reason,
      notes: notes,
      restore_inventory: restore_inventory
    )
  end

  private

  def process_refund(amount:, refund_type:, reason:, notes:, restore_inventory:)
    refund = nil

    Refund.transaction do
      # 1. Create refund record (pending)
      refund = @order.refunds.create!(
        user: @admin,
        amount: amount,
        refund_type: refund_type,
        reason: reason,
        notes: notes,
        restore_inventory: restore_inventory,
        status: "pending",
        stripe_payment_intent_id: @order.stripe_payment_intent_id
      )

      # 2. Process Stripe refund
      stripe_refund = create_stripe_refund(amount, reason)

      # 3. Mark refund as completed
      refund.mark_completed!(stripe_refund.id)

      # 4. Update order totals
      @order.update!(refunded_amount: @order.refunded_amount + amount)
      @order.update_refund_status!

      # 5. Restore inventory if requested
      if restore_inventory
        restore_order_inventory!
      end

      Rails.logger.info "[Refund] Processed #{refund_type} refund of #{amount} for order ##{@order.id}"
    end

    refund
  rescue Stripe::StripeError => e
    Rails.logger.error "[Refund] Stripe error: #{e.message}"
    refund&.mark_failed!(e.message)
    raise RefundError, "Stripe error: #{e.message}"
  rescue StandardError => e
    Rails.logger.error "[Refund] Error: #{e.message}"
    refund&.mark_failed!(e.message)
    raise RefundError, e.message
  end

  def create_stripe_refund(amount, reason)
    Stripe::Refund.create(
      {
        payment_intent: @order.stripe_payment_intent_id,
        amount: (amount * 100).to_i,  # Convert to cents
        reason: stripe_reason(reason)
      },
      {
        api_key: stripe_secret_key
      }
    )
  end

  def stripe_reason(reason)
    case reason
    when "duplicate_charge"
      "duplicate"
    when "customer_request"
      "requested_by_customer"
    else
      "requested_by_customer"  # Default
    end
  end

  def restore_order_inventory!
    @order.order_items.includes(:menu_item).each do |order_item|
      menu_item = order_item.menu_item
      next unless menu_item&.track_inventory

      menu_item.restore_stock!(
        order_item.quantity,
        reason: "refund",
        reference: @order.refunds.last,
        user: @admin,
        notes: "Refund for Order ##{@order.id}"
      )
    end
  end

  def stripe_secret_key
    @order.restaurant.stripe_secret_key.presence ||
      ENV.fetch("STRIPE_SECRET_KEY", nil)
  end
end
