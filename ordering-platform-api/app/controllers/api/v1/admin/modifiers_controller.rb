module Api
  module V1
    module Admin
      class ModifiersController < BaseController
        def create
          group = find_group(params[:modifier_group_id])
          modifier = group.modifiers.new(modifier_params)
          modifier.position ||= group.modifiers.maximum(:position).to_i + 1

          if modifier.save
            render json: modifier_json(modifier), status: :created
          else
            render json: { error: modifier.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Modifier group not found" }, status: :not_found
        end

        def update
          modifier = find_modifier(params[:id])

          if modifier.update(modifier_params)
            render json: modifier_json(modifier)
          else
            render json: { error: modifier.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Modifier not found" }, status: :not_found
        end

        def destroy
          modifier = find_modifier(params[:id])
          modifier.destroy!
          head :no_content
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Modifier not found" }, status: :not_found
        rescue ActiveRecord::DeleteRestrictionError
          render json: { error: "Cannot delete modifier used in existing orders" }, status: :unprocessable_entity
        end

        private

        def find_group(id)
          ModifierGroup.joins(menu_item: :menu_category)
            .where(menu_categories: { restaurant_id: @restaurant.id })
            .find(id)
        end

        def find_modifier(id)
          Modifier.joins(modifier_group: { menu_item: :menu_category })
            .where(menu_categories: { restaurant_id: @restaurant.id })
            .find(id)
        end

        def modifier_params
          params.require(:modifier).permit(
            :name, :price_adjustment, :default_selected, :position
          )
        end

        def modifier_json(modifier)
          {
            id: modifier.id,
            name: modifier.name,
            price_adjustment: modifier.price_adjustment.to_f,
            default_selected: modifier.default_selected,
            position: modifier.position,
            modifier_group_id: modifier.modifier_group_id
          }
        end
      end
    end
  end
end
