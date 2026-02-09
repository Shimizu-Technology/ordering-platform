module Api
  module V1
    class BaseController < ApplicationController
      before_action :set_restaurant

      private

      def set_restaurant
        @restaurant = Restaurant.active.find_by!(slug: params[:restaurant_slug])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Restaurant not found" }, status: :not_found
      end
    end
  end
end
