# frozen_string_literal: true

module Api
  module V1
    module Admin
      class RefundsController < BaseController
        before_action :set_order, only: [ :create, :order_refunds ]

        # GET /admin/refunds
        # List all refunds for the restaurant
        def index
          refunds = Refund
            .joins(:order)
            .where(orders: { restaurant_id: @restaurant.id })
            .includes(:order, :user)
            .recent
            .page(params[:page])
            .per(params[:per_page] || 20)

          render json: {
            refunds: refunds.map { |r| refund_json(r) },
            pagination: pagination_meta(refunds)
          }
        end

        # GET /admin/orders/:order_id/refunds
        # List refunds for a specific order
        def order_refunds
          refunds = @order.refunds.includes(:user).recent

          render json: {
            refunds: refunds.map { |r| refund_json(r) },
            order: order_summary_json(@order)
          }
        end

        # POST /admin/orders/:order_id/refund
        # Process a refund
        def create
          unless @order.can_refund?
            return render json: { error: "Order cannot be refunded" }, status: :unprocessable_entity
          end

          service = RefundService.new(@order, current_user)

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
            order: order_summary_json(@order.reload)
          }, status: :created
        rescue RefundService::RefundError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        # GET /admin/refunds/summary
        # Refund statistics
        def summary
          refunds = Refund
            .joins(:order)
            .where(orders: { restaurant_id: @restaurant.id })
            .completed

          start_date = params[:start_date]&.to_date || 30.days.ago.to_date
          end_date = params[:end_date]&.to_date || Date.current

          period_refunds = refunds.where(created_at: start_date.beginning_of_day..end_date.end_of_day)

          render json: {
            total_refunds: period_refunds.count,
            total_amount: period_refunds.sum(:amount).to_f,
            by_reason: period_refunds.group(:reason).count,
            by_type: period_refunds.group(:refund_type).count,
            period: {
              start_date: start_date,
              end_date: end_date
            }
          }
        end

        private

        def set_order
          @order = @restaurant.orders.find(params[:order_id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Order not found" }, status: :not_found
        end

        def refund_params
          params.require(:refund).permit(
            :amount,
            :refund_type,
            :reason,
            :notes,
            :restore_inventory
          )
        end

        def refund_json(refund)
          {
            id: refund.id,
            order_id: refund.order_id,
            amount: refund.amount.to_f,
            refund_type: refund.refund_type,
            reason: refund.reason,
            notes: refund.notes,
            status: refund.status,
            restore_inventory: refund.restore_inventory,
            stripe_refund_id: refund.stripe_refund_id,
            error_message: refund.error_message,
            processed_by: refund.user&.email,
            created_at: refund.created_at
          }
        end

        def order_summary_json(order)
          {
            id: order.id,
            total: order.total.to_f,
            refunded_amount: order.refunded_amount.to_f,
            refundable_amount: order.refundable_amount.to_f,
            refund_status: order.refund_status,
            can_refund: order.can_refund?
          }
        end

        def pagination_meta(collection)
          {
            current_page: collection.current_page,
            total_pages: collection.total_pages,
            total_count: collection.total_count
          }
        end
      end
    end
  end
end
