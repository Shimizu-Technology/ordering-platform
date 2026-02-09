class SmsService
  def self.configured?
    ENV["TWILIO_ACCOUNT_SID"].present? &&
      ENV["TWILIO_AUTH_TOKEN"].present? &&
      ENV["TWILIO_FROM_NUMBER"].present?
  end

  def self.send_order_ready(order)
    unless configured?
      Rails.logger.warn "[SMS] Twilio not configured — skipping notification"
      return { success: false, error: "SMS not configured" }
    end

    unless order.phone.present?
      return { success: false, error: "Customer has no phone number" }
    end

    restaurant = order.restaurant
    body = "Hi #{order.customer_name}! Your order ##{order.id} from #{restaurant.name} is ready for #{order.order_type == 'pickup' ? 'pickup' : 'dine-in'}. Thank you!"

    begin
      client = Twilio::REST::Client.new(
        ENV["TWILIO_ACCOUNT_SID"],
        ENV["TWILIO_AUTH_TOKEN"]
      )

      message = client.messages.create(
        from: ENV["TWILIO_FROM_NUMBER"],
        to: order.phone,
        body: body
      )

      Rails.logger.info "[SMS] Sent to #{order.phone} — SID: #{message.sid}"
      { success: true, sid: message.sid }
    rescue Twilio::REST::RestError => e
      Rails.logger.error "[SMS] Twilio error: #{e.message}"
      { success: false, error: e.message }
    rescue StandardError => e
      Rails.logger.error "[SMS] Failed: #{e.message}"
      { success: false, error: e.message }
    end
  end
end
