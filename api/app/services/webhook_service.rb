class WebhookService
  def self.notify_new_order(order)
    restaurant = order.restaurant
    return unless restaurant.webhook_url.present?

    payload = {
      event: "order.created",
      order: {
        id: order.id,
        customer_name: order.customer_name,
        phone: order.phone,
        email: order.email,
        order_type: order.order_type,
        status: order.status,
        total: order.total.to_f,
        special_instructions: order.special_instructions,
        created_at: order.created_at.iso8601,
        items: order.order_items.includes(:menu_item, order_item_modifiers: :modifier).map do |item|
          {
            name: item.menu_item.name,
            quantity: item.quantity,
            unit_price: item.unit_price.to_f,
            subtotal: item.subtotal.to_f,
            modifiers: item.order_item_modifiers.map { |m| m.modifier.name }
          }
        end
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug
      }
    }

    Thread.new do
      begin
        uri = URI.parse(restaurant.webhook_url)
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = (uri.scheme == "https")
        http.open_timeout = 5
        http.read_timeout = 10

        request = Net::HTTP::Post.new(uri.request_uri)
        request["Content-Type"] = "application/json"
        request.body = payload.to_json

        response = http.request(request)
        Rails.logger.info "[Webhook] POST #{restaurant.webhook_url} — #{response.code}"
      rescue StandardError => e
        Rails.logger.error "[Webhook] Failed: #{e.message}"
      end
    end
  end
end
