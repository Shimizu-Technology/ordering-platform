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
            orders: orders.includes(order_items: [ :menu_item, { order_item_modifiers: :modifier } ]).map { |o| order_json(o) },
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

        def refund
          order = @restaurant.orders.find(params[:id])

          unless order.can_refund?
            return render json: { error: "Order cannot be refunded" }, status: :unprocessable_entity
          end

          service = RefundService.new(order, current_user)

          refund = if refund_params[:refund_type] == "full"
            service.full_refund!(
              reason: refund_params[:reason],
              notes: refund_params[:notes]
            )
          else
            service.partial_refund!(
              amount: refund_params[:amount].to_d,
              reason: refund_params[:reason],
              notes: refund_params[:notes],
              restore_inventory: refund_params[:restore_inventory] == true
            )
          end

          render json: {
            refund: refund_json(refund),
            order: order_json(order.reload)
          }, status: :created
        rescue RefundService::RefundError => e
          render json: { error: e.message }, status: :unprocessable_entity
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Order not found" }, status: :not_found
        end

        private

        def refund_params
          params.require(:refund).permit(:amount, :refund_type, :reason, :notes, :restore_inventory)
        end

        def refund_json(refund)
          {
            id: refund.id,
            order_id: refund.order_id,
            amount: refund.amount.to_f,
            refund_type: refund.refund_type,
            reason: refund.reason,
            status: refund.status,
            stripe_refund_id: refund.stripe_refund_id,
            created_at: refund.created_at
          }
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
            refunded_amount: order.refunded_amount.to_f,
            refundable_amount: order.refundable_amount.to_f,
            refund_status: order.refund_status,
            can_refund: order.can_refund?,
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
