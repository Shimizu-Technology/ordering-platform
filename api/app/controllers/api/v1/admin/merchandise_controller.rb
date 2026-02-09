module Api
  module V1
    module Admin
      class MerchandiseController < BaseController
        # GET /api/v1/admin/merchandise
        def index
          categories = @restaurant.merchandise_categories
            .ordered
            .includes(merchandise_items: :merchandise_variants)

          render json: {
            categories: categories.map { |c| category_json(c) }
          }
        end

        # ── Categories ─────────────────────────────────────────────────────

        # POST /api/v1/admin/merchandise/categories
        def create_category
          category = @restaurant.merchandise_categories.build(category_params)

          if category.save
            render json: category_json(category), status: :created
          else
            render json: { error: category.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        end

        # PATCH /api/v1/admin/merchandise/categories/:id
        def update_category
          category = @restaurant.merchandise_categories.find(params[:id])

          if category.update(category_params)
            render json: category_json(category)
          else
            render json: { error: category.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Category not found" }, status: :not_found
        end

        # DELETE /api/v1/admin/merchandise/categories/:id
        def destroy_category
          category = @restaurant.merchandise_categories.find(params[:id])
          category.destroy!
          head :no_content
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Category not found" }, status: :not_found
        end

        # ── Items ──────────────────────────────────────────────────────────

        # POST /api/v1/admin/merchandise/items
        def create_item
          category = @restaurant.merchandise_categories.find(params[:merchandise_category_id])
          item = category.merchandise_items.build(item_params)

          if item.save
            render json: item_json(item), status: :created
          else
            render json: { error: item.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Category not found" }, status: :not_found
        end

        # PATCH /api/v1/admin/merchandise/items/:id
        def update_item
          item = find_item(params[:id])

          if item.update(item_params)
            render json: item_json(item)
          else
            render json: { error: item.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Item not found" }, status: :not_found
        end

        # DELETE /api/v1/admin/merchandise/items/:id
        def destroy_item
          item = find_item(params[:id])
          item.destroy!
          head :no_content
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Item not found" }, status: :not_found
        end

        # ── Variants ───────────────────────────────────────────────────────

        # POST /api/v1/admin/merchandise/variants
        def create_variant
          item = find_item(params[:merchandise_item_id])
          variant = item.merchandise_variants.build(variant_params)

          if variant.save
            render json: variant_json(variant), status: :created
          else
            render json: { error: variant.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Item not found" }, status: :not_found
        end

        # PATCH /api/v1/admin/merchandise/variants/:id
        def update_variant
          variant = find_variant(params[:id])

          if variant.update(variant_params)
            render json: variant_json(variant)
          else
            render json: { error: variant.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Variant not found" }, status: :not_found
        end

        # DELETE /api/v1/admin/merchandise/variants/:id
        def destroy_variant
          variant = find_variant(params[:id])
          variant.destroy!
          head :no_content
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Variant not found" }, status: :not_found
        end

        # PATCH /api/v1/admin/merchandise/variants/:id/adjust_stock
        def adjust_stock
          variant = find_variant(params[:id])
          adjustment = params[:adjustment].to_i
          reason = params[:reason] || "admin_adjustment"
          notes = params[:notes]

          if adjustment.positive?
            # Use restore_stock! for additions
            variant.restore_stock!(adjustment, reason: reason, user: current_user, notes: notes)
          elsif adjustment.negative?
            # Calculate new quantity for reductions
            new_quantity = [ variant.stock_quantity - adjustment.abs, 0 ].max
            variant.adjust_stock!(new_quantity, reason: reason, user: current_user, notes: notes)
          end

          render json: variant_json(variant.reload)
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Variant not found" }, status: :not_found
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        private

        def find_item(id)
          MerchandiseItem.joins(:merchandise_category)
            .where(merchandise_categories: { restaurant_id: @restaurant.id })
            .find(id)
        end

        def find_variant(id)
          MerchandiseVariant.joins(merchandise_item: :merchandise_category)
            .where(merchandise_categories: { restaurant_id: @restaurant.id })
            .find(id)
        end

        def category_params
          params.require(:category).permit(:name, :description, :active, :position)
        end

        def item_params
          params.require(:item).permit(:name, :description, :base_price, :image_url, :available, :position, :merchandise_category_id)
        end

        def variant_params
          params.require(:variant).permit(:name, :price, :sku, :available, :position, :track_inventory, :stock_quantity, :low_stock_threshold)
        end

        def category_json(category)
          {
            id: category.id,
            name: category.name,
            description: category.description,
            active: category.active,
            position: category.position,
            items: category.merchandise_items.ordered.map { |i| item_json(i) }
          }
        end

        def item_json(item)
          {
            id: item.id,
            name: item.name,
            description: item.description,
            base_price: item.base_price&.to_f,
            image_url: item.image_url,
            available: item.available,
            position: item.position,
            category_id: item.merchandise_category_id,
            has_variants: item.has_variants?,
            variants: item.merchandise_variants.ordered.map { |v| variant_json(v) }
          }
        end

        def variant_json(variant)
          {
            id: variant.id,
            name: variant.name,
            price: variant.price.to_f,
            sku: variant.sku,
            available: variant.available,
            position: variant.position,
            track_inventory: variant.track_inventory,
            stock_quantity: variant.stock_quantity,
            low_stock_threshold: variant.low_stock_threshold,
            in_stock: variant.in_stock?,
            low_stock: variant.low_stock?
          }
        end
      end
    end
  end
end
