class OrderEmailJob < ApplicationJob
  queue_as :default

  def perform(order_id, email_type)
    order = Order.find(order_id)

    case email_type
    when "order_confirmation"
      EmailService.send_order_confirmation(order)
    when "order_ready"
      EmailService.send_order_ready(order)
    else
      raise ArgumentError, "Unsupported order email type: #{email_type}"
    end
  end
end
