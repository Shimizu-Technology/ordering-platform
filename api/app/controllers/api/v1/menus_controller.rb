module Api
  module V1
    class MenusController < BaseController
      def show
        categories = @restaurant.menu_categories
          .active
          .ordered
          .includes(menu_items: { modifier_groups: :modifiers })

        # Get currently active promotions
        active_promos = @restaurant.active_promotions

        render json: {
          restaurant: {
            id: @restaurant.id,
            name: @restaurant.name,
            slug: @restaurant.slug,
            branding: @restaurant.branding
          },
          categories: categories.map { |cat| category_json(cat, active_promos) }
        }
      end

      private

      def category_json(category, active_promos)
        {
          id: category.id,
          name: category.name,
          position: category.position,
          items: category.menu_items.available.ordered.map { |item| item_json(item, active_promos) }
        }
      end

      def item_json(item, active_promos)
        promo = active_promos.find { |p| p.applies_to_item?(item) }

        # Determine effective availability based on stock
        in_stock = item.in_stock?
        effectively_available = item.available && in_stock

        json = {
          id: item.id,
          name: item.name,
          description: item.description,
          base_price: item.base_price.to_f,
          image_url: item.image_url,
          available: effectively_available,
          position: item.position,
          modifier_groups: item.modifier_groups.ordered.map { |mg| modifier_group_json(mg) }
        }

        # Add stock info if tracking is enabled
        if item.track_inventory
          json[:stock_status] = item.stock_status  # 'in_stock', 'low_stock', 'sold_out'
          json[:sold_out] = item.out_of_stock?
        end

        if promo
          json[:original_price] = item.base_price.to_f
          json[:discounted_price] = promo.discounted_price(item.base_price)
          json[:promotion] = {
            id: promo.id,
            name: promo.name,
            promotion_type: promo.promotion_type,
            value: promo.value.to_f
          }
        end

        json
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
