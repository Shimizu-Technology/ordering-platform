# frozen_string_literal: true

module Api
  module V1
    # Public endpoints for browsing merchandise (Latte Stone Cookies).
    class MerchandiseController < ApplicationController
      before_action :set_restaurant

      # GET /api/v1/restaurants/:restaurant_slug/merchandise
      def index
        categories = @restaurant.merchandise_categories
                                .active
                                .includes(merchandise_items: :merchandise_variants)
                                .order(:position)

        render json: {
          restaurant: {
            id: @restaurant.id,
            name: @restaurant.name,
            slug: @restaurant.slug
          },
          categories: categories.map { |cat| category_json(cat) }
        }
      end

      # GET /api/v1/restaurants/:restaurant_slug/merchandise/:id
      def show
        item = MerchandiseItem.joins(:merchandise_category)
                              .where(merchandise_categories: { restaurant_id: @restaurant.id })
                              .find(params[:id])

        render json: item_detail_json(item)
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Product not found" }, status: :not_found
      end

      private

      def set_restaurant
        @restaurant = Restaurant.active.find_by!(slug: params[:restaurant_slug])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Restaurant not found" }, status: :not_found
      end

      def category_json(category)
        {
          id: category.id,
          name: category.name,
          description: category.description,
          position: category.position,
          items: category.merchandise_items.available.order(:position).map { |item| item_json(item) }
        }
      end

      def item_json(item)
        variants = item.merchandise_variants.available.order(:position)
        min_price = variants.minimum(:price)
        max_price = variants.maximum(:price)

        {
          id: item.id,
          name: item.name,
          description: item.description,
          image_url: item.image_url,
          base_price: item.base_price&.to_f,
          price_range: min_price == max_price ? nil : { min: min_price.to_f, max: max_price.to_f },
          starting_price: min_price&.to_f || item.base_price&.to_f,
          has_variants: variants.count > 1,
          variant_count: variants.count,
          available: item.available && variants.any?
        }
      end

      def item_detail_json(item)
        {
          id: item.id,
          name: item.name,
          description: item.description,
          image_url: item.image_url,
          base_price: item.base_price&.to_f,
          category: {
            id: item.merchandise_category.id,
            name: item.merchandise_category.name
          },
          variants: item.merchandise_variants.available.order(:position).map { |v| variant_json(v) }
        }
      end

      def variant_json(variant)
        {
          id: variant.id,
          name: variant.name,
          price: variant.price.to_f,
          sku: variant.sku,
          in_stock: !variant.track_inventory || variant.stock_quantity > 0,
          stock_status: stock_status(variant)
        }
      end

      def stock_status(variant)
        return "in_stock" unless variant.track_inventory
        return "sold_out" if variant.stock_quantity <= 0
        return "low_stock" if variant.stock_quantity <= variant.low_stock_threshold

        "in_stock"
      end
    end
  end
end
