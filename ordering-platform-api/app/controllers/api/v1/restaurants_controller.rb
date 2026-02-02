module Api
  module V1
    class RestaurantsController < ApplicationController
      def show
        restaurant = Restaurant.active.find_by!(slug: params[:slug])
        render json: restaurant_json(restaurant)
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Restaurant not found" }, status: :not_found
      end

      private

      def restaurant_json(restaurant)
        {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          phone: restaurant.phone,
          address: restaurant.address,
          description: restaurant.description,
          hours: restaurant.hours,
          branding: restaurant.branding,
          active: restaurant.active
        }
      end
    end
  end
end
