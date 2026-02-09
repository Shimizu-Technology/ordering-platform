# frozen_string_literal: true

module Api
  module V1
    # Handles incoming Stripe webhooks for payment and refund events.
    # Webhook endpoint should be configured in Stripe Dashboard.
    class WebhooksController < ApplicationController
      skip_before_action :verify_authenticity_token, raise: false

      # POST /api/v1/webhooks/stripe
      def stripe
        payload = request.body.read
        sig_header = request.env["HTTP_STRIPE_SIGNATURE"]
        endpoint_secret = ENV.fetch("STRIPE_WEBHOOK_SECRET", nil)

        event = verify_webhook(payload, sig_header, endpoint_secret)

        unless event
          render json: { error: "Invalid webhook signature" }, status: :bad_request
          return
        end

        handle_event(event)

        render json: { received: true }, status: :ok
      rescue JSON::ParserError => e
        Rails.logger.error "[Stripe Webhook] JSON parse error: #{e.message}"
        render json: { error: "Invalid JSON" }, status: :bad_request
      rescue StandardError => e
        Rails.logger.error "[Stripe Webhook] Error: #{e.message}"
        Rails.logger.error e.backtrace.first(5).join("\n")
        # Return 200 to prevent Stripe retries for application errors
        render json: { received: true, warning: "Error processing webhook" }, status: :ok
      end

      private

      def verify_webhook(payload, sig_header, endpoint_secret)
        if endpoint_secret.present? && sig_header.present?
          begin
            Stripe::Webhook.construct_event(payload, sig_header, endpoint_secret)
          rescue Stripe::SignatureVerificationError => e
            Rails.logger.error "[Stripe Webhook] Signature verification failed: #{e.message}"
            nil
          end
        else
          # Development mode: parse without verification
          Rails.logger.warn "[Stripe Webhook] No endpoint secret configured, skipping verification"
          Stripe::Event.construct_from(JSON.parse(payload, symbolize_names: true))
        end
      end

      def handle_event(event)
        Rails.logger.info "[Stripe Webhook] Received event: #{event.type}"

        case event.type
        when "charge.refund.updated"
          handle_refund_updated(event.data.object)
        when "charge.refunded"
          handle_charge_refunded(event.data.object)
        when "payment_intent.succeeded"
          handle_payment_succeeded(event.data.object)
        when "payment_intent.payment_failed"
          handle_payment_failed(event.data.object)
        else
          Rails.logger.info "[Stripe Webhook] Unhandled event type: #{event.type}"
        end
      end

      # Handle refund status updates (async refunds)
      def handle_refund_updated(refund_object)
        stripe_refund_id = refund_object.id
        status = refund_object.status

        Rails.logger.info "[Stripe Webhook] Refund #{stripe_refund_id} status: #{status}"

        refund = Refund.find_by(stripe_refund_id: stripe_refund_id)
        unless refund
          Rails.logger.warn "[Stripe Webhook] Refund not found: #{stripe_refund_id}"
          return
        end

        case status
        when "succeeded"
          refund.update!(status: "completed") unless refund.completed?
          Rails.logger.info "[Stripe Webhook] Refund #{stripe_refund_id} completed"
        when "failed"
          failure_reason = refund_object.failure_reason || "Unknown failure"
          refund.mark_failed!(failure_reason)
          Rails.logger.error "[Stripe Webhook] Refund #{stripe_refund_id} failed: #{failure_reason}"
          # TODO: Notify admin of failed refund
        when "pending"
          Rails.logger.info "[Stripe Webhook] Refund #{stripe_refund_id} pending"
        when "canceled"
          refund.mark_failed!("Refund was canceled")
          Rails.logger.warn "[Stripe Webhook] Refund #{stripe_refund_id} canceled"
        end
      end

      # Handle charge.refunded event (backup for refund tracking)
      def handle_charge_refunded(charge_object)
        payment_intent_id = charge_object.payment_intent
        refunded_amount = charge_object.amount_refunded / 100.0  # Convert from cents

        Rails.logger.info "[Stripe Webhook] Charge refunded: PI=#{payment_intent_id}, amount=#{refunded_amount}"

        # Find order by payment intent
        order = Order.find_by(stripe_payment_intent_id: payment_intent_id)
        return unless order

        # Sync refunded amount if needed
        if order.refunded_amount < refunded_amount
          Rails.logger.info "[Stripe Webhook] Syncing refunded amount for Order ##{order.id}"
          order.update!(refunded_amount: refunded_amount)
          order.update_refund_status!
        end
      end

      # Handle successful payment (update order status)
      def handle_payment_succeeded(payment_intent)
        order = Order.find_by(stripe_payment_intent_id: payment_intent.id)
        return unless order

        if order.payment_status != "paid"
          order.update!(payment_status: "paid")
          Rails.logger.info "[Stripe Webhook] Order ##{order.id} payment confirmed"
        end
      end

      # Handle failed payment
      def handle_payment_failed(payment_intent)
        order = Order.find_by(stripe_payment_intent_id: payment_intent.id)
        return unless order

        error_message = payment_intent.last_payment_error&.message || "Payment failed"
        order.update!(payment_status: "failed")
        Rails.logger.warn "[Stripe Webhook] Order ##{order.id} payment failed: #{error_message}"
      end
    end
  end
end
