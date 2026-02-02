module Api
  module V1
    module Admin
      class BaseController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_restaurant

        private

        def authenticate_admin!
          token = request.headers["X-Admin-Token"]
          admin_token = ENV["ADMIN_TOKEN"]

          unless admin_token.present? && token.present? && ActiveSupport::SecurityUtils.secure_compare(token, admin_token)
            render json: { error: "Unauthorized" }, status: :unauthorized
          end
        end

        def set_restaurant
          slug = params[:restaurant_slug] || Restaurant.active.first&.slug
          @restaurant = Restaurant.active.find_by!(slug: slug)
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Restaurant not found" }, status: :not_found
        end
      end
    end
  end
end
