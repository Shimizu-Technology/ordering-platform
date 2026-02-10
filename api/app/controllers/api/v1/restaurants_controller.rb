module Api
  module V1
    class RestaurantsController < ApplicationController
      include ClerkAuthenticatable

      before_action :authorize_restaurant_setup!, only: [ :create, :setup ]

      def show
        restaurant = Restaurant.active.find_by!(slug: params[:slug])
        render json: restaurant_json(restaurant)
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Restaurant not found" }, status: :not_found
      end

      # POST /api/v1/restaurants — create a new restaurant (onboarding step 1)
      def create
        restaurant = Restaurant.new(create_params)
        restaurant.status = "setup_pending"
        restaurant.active = false # Not active until setup completes

        if restaurant.save
          restaurant.seed_default_categories!
          render json: restaurant_json(restaurant).merge(status: restaurant.status), status: :created
        else
          render json: { errors: restaurant.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/restaurants/:slug/setup — complete setup (onboarding steps 2-4)
      def setup
        restaurant = Restaurant.find_by!(slug: params[:slug])

        if restaurant.status == "active"
          render json: { error: "Restaurant is already set up" }, status: :unprocessable_entity
          return
        end

        if restaurant.update(setup_params)
          restaurant.update!(status: "active", active: true)
          render json: restaurant_json(restaurant).merge(status: restaurant.status)
        else
          render json: { errors: restaurant.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Restaurant not found" }, status: :not_found
      end

      private

      def authorize_restaurant_setup!
        # Prefer a dedicated internal token for onboarding automation/scripts.
        setup_token = ENV["RESTAURANT_SETUP_TOKEN"]
        request_token = request.headers["X-Restaurant-Setup-Token"] || request.headers["X-Setup-Token"]

        if setup_token.present?
          return if request_token.present? && ActiveSupport::SecurityUtils.secure_compare(request_token, setup_token)
        elsif Rails.env.development?
          # Development convenience when the setup token is not configured.
          return
        end

        # Fallback: allow authenticated super admins to perform setup actions.
        authenticate_user_optional
        return if current_user&.super_admin?

        render json: { error: "Unauthorized" }, status: :unauthorized
      end

      def create_params
        params.require(:restaurant).permit(:name, :phone, :email, :address, :description)
      end

      def setup_params
        params.require(:restaurant).permit(
          :primary_color, :secondary_color, :accent_color, :font_family, :logo_url,
          hours: {}
        )
      end

      def restaurant_json(restaurant)
        {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          phone: restaurant.phone,
          email: restaurant.email,
          address: restaurant.address,
          description: restaurant.description,
          hours: restaurant.hours,
          branding: restaurant.branding,
          features: restaurant.features,
          default_prep_time_minutes: restaurant.default_prep_time_minutes,
          active: restaurant.active
        }
      end
    end
  end
end
