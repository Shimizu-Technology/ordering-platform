module Api
  module V1
    module Admin
      class CategoriesController < BaseController
        def index
          categories = @restaurant.menu_categories.ordered
            .includes(menu_items: { modifier_groups: :modifiers })

          render json: categories.map { |c| category_json(c) }
        end

        def create
          category = @restaurant.menu_categories.new(category_params)
          category.position ||= @restaurant.menu_categories.maximum(:position).to_i + 1

          if category.save
            render json: category_json(category), status: :created
          else
            render json: { error: category.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        end

        def update
          category = @restaurant.menu_categories.find(params[:id])

          if category.update(category_params)
            render json: category_json(category)
          else
            render json: { error: category.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Category not found" }, status: :not_found
        end

        def destroy
          category = @restaurant.menu_categories.find(params[:id])
          category.destroy!
          head :no_content
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Category not found" }, status: :not_found
        end

        def reorder
          ids = params[:ids]
          return render json: { error: "ids required" }, status: :unprocessable_entity unless ids.is_a?(Array)

          ActiveRecord::Base.transaction do
            ids.each_with_index do |id, index|
              @restaurant.menu_categories.where(id: id).update_all(position: index)
            end
          end

          head :no_content
        end

        private

        def category_params
          params.require(:category).permit(:name, :active, :position)
        end

        def category_json(category)
          {
            id: category.id,
            name: category.name,
            position: category.position,
            active: category.active,
            items_count: category.menu_items.size,
            items: category.menu_items.ordered.map { |item| item_json(item) }
          }
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
            modifier_groups_count: item.modifier_groups.size,
            modifier_groups: item.modifier_groups.ordered.map { |mg| modifier_group_json(mg) }
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
