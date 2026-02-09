module Api
  module V1
    class OrdersController < BaseController
      class OrderError < StandardError; end
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
          customer_id: order_params[:customer_id],
          tip_amount: order_params[:tip_amount] || 0,
          tip_percentage: order_params[:tip_percentage],
          source: order_params[:source] || "online",
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

        # Fire notifications
        send_order_notifications(order)

        render json: order_json(order), status: :created
      rescue OrderError => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue ActiveRecord::RecordNotFound => e
        render json: { error: "Menu item or modifier not found: #{e.message}" }, status: :unprocessable_entity
      end

      # POST /api/v1/restaurants/:slug/orders/:id/reorder
      def reorder
        original = @restaurant.orders.find(params[:id])

        new_order = @restaurant.orders.new(
          customer_name: original.customer_name,
          phone: original.phone,
          email: original.email,
          order_type: original.order_type,
          customer_id: original.customer_id,
          status: "pending"
        )

        ActiveRecord::Base.transaction do
          new_order.save!

          original.order_items.includes(:menu_item, order_item_modifiers: :modifier).each do |orig_item|
            # Skip items whose menu item is no longer available
            next unless orig_item.menu_item&.available

            order_item = new_order.order_items.create!(
              menu_item: orig_item.menu_item,
              quantity: orig_item.quantity,
              unit_price: orig_item.menu_item.base_price, # Use current price
              subtotal: 0
            )

            orig_item.order_item_modifiers.each do |oim|
              order_item.order_item_modifiers.create!(
                modifier: oim.modifier,
                price_adjustment: oim.modifier.price_adjustment # Use current price
              )
            end
          end

          new_order.recalculate!
        end

        render json: order_json(new_order), status: :created
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Order not found" }, status: :not_found
      end

      def pay
        order = @restaurant.orders.find(params[:id])

        unless order.status == "pending"
          return render json: { error: "Order cannot be paid in current status" }, status: :unprocessable_entity
        end

        unless ENV["STRIPE_SECRET_KEY"].present?
          return render json: { error: "Payment processing is not configured" }, status: :service_unavailable
        end

        intent_params = {
          amount: (order.total * 100).to_i,
          currency: "usd",
          metadata: {
            order_id: order.id,
            restaurant_id: @restaurant.id,
            restaurant_slug: @restaurant.slug
          }
        }

        # Use Stripe Connect if restaurant has a connected account
        if @restaurant.stripe_account_id.present? && @restaurant.stripe_onboarding_complete
          fee_percent = StripeConnectService.platform_fee_percent
          application_fee = ((order.total * 100) * (fee_percent / 100.0)).round
          intent_params[:application_fee_amount] = application_fee
          intent_params[:transfer_data] = { destination: @restaurant.stripe_account_id }
        end

        payment_intent = Stripe::PaymentIntent.create(intent_params)

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

      def send_order_notifications(order)
        restaurant = order.restaurant
        return unless restaurant.notifications_enabled

        # Email confirmation to customer
        if order.email.present? && ENV["SMTP_HOST"].present?
          begin
            OrderMailer.order_confirmation(order).deliver_later
          rescue StandardError => e
            Rails.logger.error "[Notification] Email failed: #{e.message}"
          end
        end

        # Webhook to restaurant
        WebhookService.notify_new_order(order)
      rescue StandardError => e
        Rails.logger.error "[Notification] Unexpected error: #{e.message}"
      end

      def order_params
        params.require(:order).permit(
          :customer_name, :phone, :email, :order_type, :special_instructions, :customer_id, :location_id,
          :tip_amount, :tip_percentage, :source,
          items: [ :menu_item_id, :quantity, :special_instructions, modifier_ids: [] ]
        )
      end

      def build_order_items(order, items_data)
        items_data.each do |item_data|
          menu_item = MenuItem.find(item_data[:menu_item_id])
          quantity = item_data[:quantity] || 1

          # Check availability
          unless menu_item.available
            raise OrderError, "#{menu_item.name} is currently unavailable"
          end

          # Check stock if inventory tracking is enabled
          if menu_item.track_inventory && !menu_item.can_fulfill?(quantity)
            stock = menu_item.stock_quantity || 0
            if stock <= 0
              raise OrderError, "#{menu_item.name} is sold out"
            else
              raise OrderError, "Only #{stock} #{menu_item.name} available (requested #{quantity})"
            end
          end

          order_item = order.order_items.create!(
            menu_item: menu_item,
            quantity: quantity,
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

          # Decrement stock after successful item creation
          if menu_item.track_inventory
            menu_item.decrement_stock!(quantity, order: order)
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
          source: order.source,
          subtotal: order.subtotal.to_f,
          tip_amount: order.tip_amount.to_f,
          tip_percentage: order.tip_percentage,
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
