module Api
  module V1
    module Admin
      class OrdersController < BaseController
        def index
          orders = @restaurant.orders.order(created_at: :desc)

          # Filter by status
          if params[:status].present?
            orders = orders.by_status(params[:status])
          end

          # Search by customer name
          if params[:search].present?
            orders = orders.where("customer_name ILIKE ?", "%#{params[:search]}%")
          end

          # Pagination
          page = (params[:page] || 1).to_i
          per_page = (params[:per_page] || 25).to_i.clamp(1, 100)
          total = orders.count
          orders = orders.offset((page - 1) * per_page).limit(per_page)

          render json: {
            orders: orders.includes(order_items: [:menu_item, { order_item_modifiers: :modifier }]).map { |o| order_json(o) },
            meta: {
              page: page,
              per_page: per_page,
              total: total,
              total_pages: (total.to_f / per_page).ceil
            }
          }
        end

        def update
          order = @restaurant.orders.find(params[:id])
          valid_transitions = {
            "pending" => %w[confirmed preparing cancelled],
            "confirmed" => %w[preparing cancelled],
            "preparing" => %w[ready cancelled],
            "ready" => %w[completed],
            "completed" => [],
            "cancelled" => []
          }

          new_status = params[:status]
          unless valid_transitions[order.status]&.include?(new_status)
            return render json: {
              error: "Cannot transition from '#{order.status}' to '#{new_status}'"
            }, status: :unprocessable_entity
          end

          order.update!(status: new_status)
          render json: order_json(order)
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Order not found" }, status: :not_found
        end

        def notify_ready
          order = @restaurant.orders.find(params[:id])

          unless order.status == "ready"
            return render json: { error: "Order must be in 'ready' status to notify" }, status: :unprocessable_entity
          end

          unless SmsService.configured?
            return render json: { error: "SMS not configured" }, status: :service_unavailable
          end

          result = SmsService.send_order_ready(order)

          if result[:success]
            render json: { message: "Customer notified via SMS", sid: result[:sid] }
          else
            render json: { error: result[:error] }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Order not found" }, status: :not_found
        end

        private

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
            created_at: order.created_at.iso8601,
            updated_at: order.updated_at.iso8601,
            items: order.order_items.map do |item|
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
end
