module Api
  module V1
    class OrdersController < BaseController
      def show
        order = @restaurant.orders.find(params[:id])
        render json: order_json(order)
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Order not found" }, status: :not_found
      end

      def create
        order = @restaurant.orders.new(
          customer_name: order_params[:customer_name],
          phone: order_params[:phone],
          email: order_params[:email],
          order_type: order_params[:order_type] || "pickup",
          special_instructions: order_params[:special_instructions],
          status: "pending"
        )

        if order_params[:items].blank?
          return render json: { error: "Order must contain at least one item" }, status: :unprocessable_entity
        end

        ActiveRecord::Base.transaction do
          order.save!
          build_order_items(order, order_params[:items])
          order.recalculate!
        end

        render json: order_json(order), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue ActiveRecord::RecordNotFound => e
        render json: { error: "Menu item or modifier not found: #{e.message}" }, status: :unprocessable_entity
      end

      def pay
        order = @restaurant.orders.find(params[:id])

        unless order.status == "pending"
          return render json: { error: "Order cannot be paid in current status" }, status: :unprocessable_entity
        end

        unless ENV["STRIPE_SECRET_KEY"].present?
          return render json: { error: "Payment processing is not configured" }, status: :service_unavailable
        end

        payment_intent = Stripe::PaymentIntent.create(
          amount: (order.total * 100).to_i,
          currency: "usd",
          metadata: {
            order_id: order.id,
            restaurant_id: @restaurant.id,
            restaurant_slug: @restaurant.slug
          }
        )

        order.update!(stripe_payment_intent_id: payment_intent.id)

        render json: {
          client_secret: payment_intent.client_secret,
          payment_intent_id: payment_intent.id,
          amount: order.total.to_f
        }
      rescue Stripe::StripeError => e
        render json: { error: e.message }, status: :payment_required
      end

      private

      def order_params
        params.require(:order).permit(
          :customer_name, :phone, :email, :order_type, :special_instructions,
          items: [:menu_item_id, :quantity, :special_instructions, modifier_ids: []]
        )
      end

      def build_order_items(order, items_data)
        items_data.each do |item_data|
          menu_item = MenuItem.find(item_data[:menu_item_id])
          order_item = order.order_items.create!(
            menu_item: menu_item,
            quantity: item_data[:quantity] || 1,
            unit_price: menu_item.base_price,
            subtotal: 0 # Will be recalculated
          )

          if item_data[:modifier_ids].present?
            item_data[:modifier_ids].each do |modifier_id|
              modifier = Modifier.find(modifier_id)
              order_item.order_item_modifiers.create!(
                modifier: modifier,
                price_adjustment: modifier.price_adjustment
              )
            end
          end
        end
      end

      def order_json(order)
        {
          id: order.id,
          customer_name: order.customer_name,
          phone: order.phone,
          email: order.email,
          order_type: order.order_type,
          status: order.status,
          total: order.total.to_f,
          special_instructions: order.special_instructions,
          stripe_payment_intent_id: order.stripe_payment_intent_id,
          created_at: order.created_at,
          items: order.order_items.includes(:menu_item, order_item_modifiers: :modifier).map do |item|
            {
              id: item.id,
              menu_item_name: item.menu_item.name,
              menu_item_id: item.menu_item_id,
              quantity: item.quantity,
              unit_price: item.unit_price.to_f,
              subtotal: item.subtotal.to_f,
              special_instructions: item.special_instructions,
              modifiers: item.order_item_modifiers.map do |oim|
                {
                  name: oim.modifier.name,
                  price_adjustment: oim.price_adjustment.to_f
                }
              end
            }
          end
        }
      end
    end
  end
end
