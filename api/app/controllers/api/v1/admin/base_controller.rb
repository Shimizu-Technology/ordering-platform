module Api
  module V1
    module Admin
      class BaseController < ApplicationController
        include ClerkAuthenticatable

        before_action :set_restaurant
        before_action :require_staff!
        before_action :require_restaurant_access!

        private

        def set_restaurant
          slug = params[:restaurant_slug]
          if slug.blank?
            render json: { error: "restaurant_slug is required" }, status: :bad_request
            return
          end

          @restaurant = Restaurant.active.find_by!(slug: slug)
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Restaurant not found" }, status: :not_found
        end

        # Skip Clerk auth in development if no JWKS configured
        # Uses legacy ADMIN_TOKEN for backward compatibility
        def require_staff!
          if skip_clerk_auth?
            authenticate_legacy_admin!
          else
            super
          end
        end

        def require_restaurant_access!
          return if skip_clerk_auth?

          super
        end

        def skip_clerk_auth?
          Rails.env.development? &&
            ENV["CLERK_JWKS_URL"].blank? &&
            ENV["CLERK_ISSUER"].blank?
        end

        # Legacy token auth for development without Clerk
        def authenticate_legacy_admin!
          token = request.headers["X-Admin-Token"]
          admin_token = ENV["ADMIN_TOKEN"]

          # In dev without tokens, allow access for testing
          return if Rails.env.development? && admin_token.blank?

          unless admin_token.present? && token.present? && ActiveSupport::SecurityUtils.secure_compare(token, admin_token)
            render json: { error: "Unauthorized" }, status: :unauthorized
          end
        end
      end
    end
  end
end
