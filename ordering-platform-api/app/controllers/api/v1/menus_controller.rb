module Api
  module V1
    class MenusController < BaseController
      def show
        categories = @restaurant.menu_categories
          .active
          .ordered
          .includes(menu_items: { modifier_groups: :modifiers })

        render json: {
          restaurant: {
            id: @restaurant.id,
            name: @restaurant.name,
            slug: @restaurant.slug,
            branding: @restaurant.branding
          },
          categories: categories.map { |cat| category_json(cat) }
        }
      end

      private

      def category_json(category)
        {
          id: category.id,
          name: category.name,
          position: category.position,
          items: category.menu_items.available.ordered.map { |item| item_json(item) }
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
          selection_label: group.selection_label,
          position: group.position,
          modifiers: group.modifiers.ordered.map { |m| modifier_json(m) }
        }
      end

      def modifier_json(modifier)
        {
          id: modifier.id,
          name: modifier.name,
          price_adjustment: modifier.price_adjustment.to_f,
          display_price: modifier.display_price,
          default_selected: modifier.default_selected,
          position: modifier.position
        }
      end
    end
  end
end
