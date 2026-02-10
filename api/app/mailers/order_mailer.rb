class OrderMailer < ApplicationMailer
  def order_confirmation(order)
    @order = order
    @restaurant = order.restaurant
    @items = order.order_items.includes(:menu_item, order_item_modifiers: :modifier)

    mail(
      to: order.email,
      subject: "Order ##{order.id} Confirmed — #{@restaurant.name}"
    )
  end

  def order_ready(order)
    @order = order
    @restaurant = order.restaurant
    @items = order.order_items.includes(:menu_item, order_item_modifiers: :modifier)

    mail(
      to: order.email,
      subject: "Your Order ##{order.id} is Ready — #{@restaurant.name}"
    )
  end
end
