module Api
  module V1
    module Admin
      class AnalyticsController < BaseController
        # GET /api/v1/admin/analytics/overview
        def overview
          today = Date.current
          orders_today = completed_orders.where(created_at: today.beginning_of_day..today.end_of_day)

          revenue = orders_today.sum(:total).to_f
          order_count = orders_today.count
          avg_value = order_count > 0 ? (revenue / order_count).round(2) : 0.0

          top_items = top_selling_items(orders_today, 5)

          render json: {
            date: today.iso8601,
            revenue: revenue,
            order_count: order_count,
            avg_order_value: avg_value,
            top_items: top_items
          }
        end

        # GET /api/v1/admin/analytics/revenue
        def revenue
          start_date = parse_date(params[:start_date], 30.days.ago.to_date)
          end_date = parse_date(params[:end_date], Date.current)
          granularity = params[:granularity] || "daily"

          orders = completed_orders.where(created_at: start_date.beginning_of_day..end_date.end_of_day)

          data = case granularity
          when "weekly"
                   group_revenue_by(orders, :weekly)
          when "monthly"
                   group_revenue_by(orders, :monthly)
          else
                   group_revenue_by(orders, :daily)
          end

          render json: {
            start_date: start_date.iso8601,
            end_date: end_date.iso8601,
            granularity: granularity,
            total_revenue: orders.sum(:total).to_f,
            data_points: data
          }
        end

        # GET /api/v1/admin/analytics/items
        def items
          start_date = parse_date(params[:start_date], 30.days.ago.to_date)
          end_date = parse_date(params[:end_date], Date.current)
          limit = (params[:limit] || 20).to_i.clamp(1, 100)

          orders = completed_orders.where(created_at: start_date.beginning_of_day..end_date.end_of_day)
          order_ids = orders.pluck(:id)

          top = OrderItem.where(order_id: order_ids)
            .joins(:menu_item)
            .group("menu_items.id", "menu_items.name")
            .select(
              "menu_items.id AS item_id",
              "menu_items.name AS item_name",
              "SUM(order_items.quantity) AS total_quantity",
              "SUM(order_items.subtotal) AS total_revenue",
              "COUNT(DISTINCT order_items.order_id) AS order_count"
            )
            .order("total_quantity DESC")
            .limit(limit)

          render json: {
            start_date: start_date.iso8601,
            end_date: end_date.iso8601,
            items: top.map do |row|
              {
                item_id: row.item_id,
                item_name: row.item_name,
                total_quantity: row.total_quantity.to_i,
                total_revenue: row.total_revenue.to_f,
                order_count: row.order_count.to_i
              }
            end
          }
        end

        # GET /api/v1/admin/analytics/hours
        def hours
          start_date = parse_date(params[:start_date], 30.days.ago.to_date)
          end_date = parse_date(params[:end_date], Date.current)

          orders = completed_orders.where(created_at: start_date.beginning_of_day..end_date.end_of_day)

          hourly_data = orders
            .group("EXTRACT(HOUR FROM created_at)::integer")
            .select(
              "EXTRACT(HOUR FROM created_at)::integer AS hour",
              "COUNT(*) AS order_count",
              "SUM(total) AS revenue"
            )
            .order("hour")

          hours_map = hourly_data.index_by { |r| r.hour }
          full_data = (0..23).map do |h|
            row = hours_map[h]
            {
              hour: h,
              label: format_hour(h),
              order_count: row&.order_count.to_i,
              revenue: row&.revenue.to_f
            }
          end

          render json: {
            start_date: start_date.iso8601,
            end_date: end_date.iso8601,
            hours: full_data
          }
        end

        private

        def completed_orders
          @restaurant.orders.where.not(status: "cancelled")
        end

        def group_revenue_by(orders, granularity)
          period_expr = case granularity
          when :weekly
            "DATE_TRUNC('week', created_at)::date"
          when :monthly
            "DATE_TRUNC('month', created_at)::date"
          else
            "DATE(created_at)"
          end

          rows = orders
            .group(Arel.sql(period_expr))
            .order(Arel.sql(period_expr))
            .pluck(Arel.sql(period_expr), Arel.sql("SUM(total)"), Arel.sql("COUNT(*)"))

          rows.map do |date, rev, count|
            {
              date: date.is_a?(String) ? date : date.to_date.iso8601,
              revenue: rev.to_f,
              order_count: count.to_i
            }
          end
        end

        def top_selling_items(orders_scope, limit)
          order_ids = orders_scope.pluck(:id)
          return [] if order_ids.empty?

          OrderItem.where(order_id: order_ids)
            .joins(:menu_item)
            .group("menu_items.id", "menu_items.name")
            .select(
              "menu_items.name AS item_name",
              "SUM(order_items.quantity) AS total_quantity"
            )
            .order("total_quantity DESC")
            .limit(limit)
            .map { |r| { name: r.item_name, quantity: r.total_quantity.to_i } }
        end

        def parse_date(str, default)
          str.present? ? Date.parse(str) : default
        rescue Date::Error
          default
        end

        def format_hour(h)
          if h == 0
            "12 AM"
          elsif h < 12
            "#{h} AM"
          elsif h == 12
            "12 PM"
          else
            "#{h - 12} PM"
          end
        end
      end
    end
  end
end
