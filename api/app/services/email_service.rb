class EmailService
  class EmailError < StandardError; end

  class << self
    def configured?
      ENV["RESEND_API_KEY"].present?
    end

    def send_order_confirmation(order)
      send_order_email(
        order: order,
        template: "order_mailer/order_confirmation",
        subject: "Order ##{order.id} Confirmed — #{order.restaurant.name}"
      )
    end

    def send_order_ready(order)
      send_order_email(
        order: order,
        template: "order_mailer/order_ready",
        subject: "Your Order ##{order.id} is Ready — #{order.restaurant.name}"
      )
    end

    private

    def send_order_email(order:, template:, subject:)
      raise EmailError, "Resend is not configured" unless configured?
      raise EmailError, "Order does not have a customer email address" if order.email.blank?

      from_email = ENV.fetch("MAILER_FROM_EMAIL", "noreply@example.com")
      html = ApplicationController.renderer.render(
        template: template,
        layout: false,
        assigns: {
          order: order,
          restaurant: order.restaurant,
          items: order.order_items.includes(:menu_item, order_item_modifiers: :modifier)
        }
      )

      response = Resend::Emails.send(
        {
        from: from_email,
        to: [ order.email ],
        subject: subject,
        html: html
        }
      )

      Rails.logger.info("[EmailService] Sent #{template} for order ##{order.id}: #{response.inspect}")
      response
    rescue StandardError => e
      Rails.logger.error("[EmailService] Failed #{template} for order ##{order.id}: #{e.class} #{e.message}")
      raise EmailError, e.message
    end
  end
end
