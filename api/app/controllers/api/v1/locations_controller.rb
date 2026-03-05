# frozen_string_literal: true

module Api
  module V1
    class LocationsController < ApplicationController
      before_action :set_restaurant

      # GET /api/v1/restaurants/:restaurant_slug/locations
      def index
        locations = @restaurant.locations.active.ordered

        render json: {
          locations: locations.map { |loc| location_json(loc) }
        }
      end

      # GET /api/v1/restaurants/:restaurant_slug/locations/:slug
      def show
        location = @restaurant.locations.active.find_by!(slug: params[:slug])
        render json: location_json(location)
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Location not found" }, status: :not_found
      end

      private

      def set_restaurant
        @restaurant = Restaurant.active.find_by!(slug: params[:restaurant_slug])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Restaurant not found" }, status: :not_found
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
