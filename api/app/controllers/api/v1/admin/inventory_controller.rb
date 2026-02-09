# frozen_string_literal: true

module Api
  module V1
    module Admin
      class InventoryController < BaseController
        # GET /admin/inventory
        # List all items (with option to filter)
        def index
          items = MenuItem
            .joins(:menu_category)
            .where(menu_categories: { restaurant_id: @restaurant.id })
            .includes(:menu_category)
            .order("menu_categories.position, menu_items.position")

          # Filter by tracking status
          if params[:type].present? && params[:type] != "all"
            # Future: filter by MenuItem vs MerchandiseVariant
          end

          # Filter by stock status
          case params[:status]
          when "low_stock"
            items = items.tracking_inventory.low_stock
          when "sold_out", "out_of_stock"
            items = items.tracking_inventory.out_of_stock
          when "in_stock"
            items = items.tracking_inventory.in_stock
          end

          # Search
          if params[:search].present?
            items = items.where("menu_items.name ILIKE ?", "%#{params[:search]}%")
          end

          # Calculate stats
          all_items = MenuItem.joins(:menu_category).where(menu_categories: { restaurant_id: @restaurant.id })
          tracked_items = all_items.tracking_inventory

          render json: {
            items: items.map { |item| inventory_item_json(item) },
            meta: {
              total: all_items.count,
              tracked: tracked_items.count,
              low_stock: tracked_items.low_stock.count,
              sold_out: tracked_items.out_of_stock.count
            }
          }
        end

        # GET /admin/inventory/low-stock
        # Items at or below threshold
        def low_stock
          items = InventoryService.low_stock_items(@restaurant).includes(:menu_category)

          render json: {
            items: items.map { |item| inventory_item_json(item) }
          }
        end

        # GET /admin/inventory/out-of-stock
        # Items with zero stock
        def out_of_stock
          items = InventoryService.out_of_stock_items(@restaurant).includes(:menu_category)

          render json: {
            items: items.map { |item| inventory_item_json(item) }
          }
        end

        # PATCH /admin/inventory/:type/:id
        # Update inventory settings for an item
        def update_item
          item = find_item_by_type

          if params[:stock_quantity].present?
            item.adjust_stock!(
              params[:stock_quantity].to_i,
              reason: params[:reason] || "manual",
              user: current_user,
              notes: params[:notes]
            )
          end

          # Update other inventory settings
          item.update!(inventory_settings_params) if inventory_settings_params.any?

          render json: inventory_item_json(item.reload)
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Item not found" }, status: :not_found
        end

        # POST /admin/inventory/:type/:id/adjust
        # Manual stock adjustment with reason
        def adjust_item
          item = find_item_by_type

          adjustment = params[:adjustment].to_i
          new_quantity = (item.stock_quantity || 0) + adjustment

          if new_quantity < 0
            return render json: { error: "Adjustment would result in negative stock" }, status: :unprocessable_entity
          end

          item.adjust_stock!(
            new_quantity,
            reason: params[:reason] || "manual",
            user: current_user,
            notes: params[:notes]
          )

          render json: inventory_item_json(item.reload)
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Item not found" }, status: :not_found
        end

        def find_item_by_type
          case params[:type]
          when "MenuItem"
            MenuItem
              .joins(:menu_category)
              .where(menu_categories: { restaurant_id: @restaurant.id })
              .find(params[:id])
          when "MerchandiseVariant"
            MerchandiseVariant
              .joins(merchandise_item: :merchandise_category)
              .where(merchandise_categories: { restaurant_id: @restaurant.id })
              .find(params[:id])
          else
            raise ActiveRecord::RecordNotFound, "Unknown item type"
          end
        end

        # GET /admin/inventory/audit-log
        # Stock adjustment history
        def audit_log
          # Get adjustable IDs for this restaurant's menu items
          menu_item_ids = MenuItem
            .joins(:menu_category)
            .where(menu_categories: { restaurant_id: @restaurant.id })
            .pluck(:id)

          adjustments = StockAdjustment
            .where(adjustable_type: "MenuItem", adjustable_id: menu_item_ids)
            .includes(:adjustable, :user)
            .recent
            .page(params[:page])
            .per(params[:per_page] || 50)

          render json: {
            adjustments: adjustments.map { |adj| adjustment_json(adj) },
            pagination: pagination_meta(adjustments)
          }
        end

        private

        def inventory_params
          params.permit(:stock_quantity, :reason, :notes)
        end

        def inventory_settings_params
          params.permit(:track_inventory, :low_stock_threshold)
        end

        def adjustment_params
          params.require(:adjustment_data).permit(:adjustment, :reason, :notes)
        end

        def inventory_item_json(item)
          {
            id: item.id,
            type: "MenuItem",
            name: item.name,
            category_name: item.menu_category.name,
            track_inventory: item.track_inventory,
            stock_quantity: item.stock_quantity,
            low_stock_threshold: item.low_stock_threshold,
            stock_status: item.stock_status,
            available: item.available,
            base_price: item.base_price.to_f
          }
        end

        def adjustment_json(adj)
          {
            id: adj.id,
            item_name: adj.adjustable&.name,
            item_type: adj.adjustable_type,
            quantity_before: adj.quantity_before,
            quantity_after: adj.quantity_after,
            adjustment: adj.adjustment,
            reason: adj.reason,
            notes: adj.notes,
            user: adj.user&.email,
            created_at: adj.created_at
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
