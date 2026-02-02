module Api
  module V1
    module Admin
      class MenuItemsController < BaseController
        def create
          category = @restaurant.menu_categories.find(params[:menu_category_id])
          item = category.menu_items.new(item_params)
          item.position ||= category.menu_items.maximum(:position).to_i + 1

          if item.save
            render json: item_json(item), status: :created
          else
            render json: { error: item.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Category not found" }, status: :not_found
        end

        def update
          item = find_item(params[:id])

          if item.update(item_params)
            render json: item_json(item)
          else
            render json: { error: item.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Menu item not found" }, status: :not_found
        end

        def destroy
          item = find_item(params[:id])
          item.destroy!
          head :no_content
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Menu item not found" }, status: :not_found
        rescue ActiveRecord::DeleteRestrictionError
          render json: { error: "Cannot delete item with existing orders" }, status: :unprocessable_entity
        end

        def reorder
          ids = params[:ids]
          category_id = params[:menu_category_id]
          return render json: { error: "ids required" }, status: :unprocessable_entity unless ids.is_a?(Array)

          category = @restaurant.menu_categories.find(category_id) if category_id
          ActiveRecord::Base.transaction do
            ids.each_with_index do |id, index|
              scope = category ? category.menu_items : MenuItem.joins(:menu_category).where(menu_categories: { restaurant_id: @restaurant.id })
              scope.where(id: id).update_all(position: index)
            end
          end

          head :no_content
        end

        private

        def find_item(id)
          MenuItem.joins(:menu_category)
            .where(menu_categories: { restaurant_id: @restaurant.id })
            .find(id)
        end

        def item_params
          params.require(:menu_item).permit(
            :name, :description, :base_price, :image_url, :available, :position, :menu_category_id
          )
        end

        def item_json(item)
          {
            id: item.id,
            name: item.name,
            description: item.description,
            base_price: item.base_price.to_f,
            image_url: item.image_url,
            available: item.available,
            position: item.position,
            menu_category_id: item.menu_category_id,
            modifier_groups_count: item.modifier_groups.size,
            modifier_groups: item.modifier_groups.ordered.includes(:modifiers).map { |mg| modifier_group_json(mg) }
          }
        end

        def modifier_group_json(group)
          {
            id: group.id,
            name: group.name,
            required: group.required,
            min_select: group.min_select,
            max_select: group.max_select,
            position: group.position,
            modifiers: group.modifiers.ordered.map { |m| modifier_json(m) }
          }
        end

        def modifier_json(modifier)
          {
            id: modifier.id,
            name: modifier.name,
            price_adjustment: modifier.price_adjustment.to_f,
            default_selected: modifier.default_selected,
            position: modifier.position
          }
        end
      end
    end
  end
end
