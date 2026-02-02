module Api
  module V1
    module Admin
      class ModifierGroupsController < BaseController
        def create
          item = find_menu_item(params[:menu_item_id])
          group = item.modifier_groups.new(group_params)
          group.position ||= item.modifier_groups.maximum(:position).to_i + 1

          if group.save
            render json: group_json(group), status: :created
          else
            render json: { error: group.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Menu item not found" }, status: :not_found
        end

        def update
          group = find_group(params[:id])

          if group.update(group_params)
            render json: group_json(group)
          else
            render json: { error: group.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Modifier group not found" }, status: :not_found
        end

        def destroy
          group = find_group(params[:id])
          group.destroy!
          head :no_content
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Modifier group not found" }, status: :not_found
        end

        private

        def find_menu_item(id)
          MenuItem.joins(:menu_category)
            .where(menu_categories: { restaurant_id: @restaurant.id })
            .find(id)
        end

        def find_group(id)
          ModifierGroup.joins(menu_item: :menu_category)
            .where(menu_categories: { restaurant_id: @restaurant.id })
            .find(id)
        end

        def group_params
          params.require(:modifier_group).permit(
            :name, :required, :min_select, :max_select, :position
          )
        end

        def group_json(group)
          {
            id: group.id,
            name: group.name,
            required: group.required,
            min_select: group.min_select,
            max_select: group.max_select,
            position: group.position,
            menu_item_id: group.menu_item_id,
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
