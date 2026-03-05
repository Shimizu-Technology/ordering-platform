# frozen_string_literal: true

module Api
  module V1
    module Admin
      class LocationsController < Admin::BaseController
        # NOTE: set_restaurant is inherited from Admin::BaseController — no override needed.

        # GET /api/v1/admin/restaurants/:restaurant_slug/locations
        def index
          locations = @restaurant.locations.ordered
          render json: locations.map { |loc| location_json(loc) }
        end

        # PATCH /api/v1/admin/restaurants/:restaurant_slug/locations/:id
        def update
          location = @restaurant.locations.find(params[:id])
          if location.update(location_params)
            render json: location_json(location)
          else
            render json: { errors: location.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def location_params
          params.require(:location).permit(:name, :address, :phone, :email, :map_url, :active)
        end

        def location_json(location)
          {
            id: location.id,
            name: location.name,
            slug: location.slug,
            address: location.address,
            phone: location.phone,
            email: location.email,
            hours: location.hours,
            active: location.active,
            map_url: location.map_url
          }
        end
      end
    end
  end
end
