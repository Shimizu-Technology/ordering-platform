module Api
  module V1
    module Admin
      class RestaurantsController < BaseController
        def show
          render json: restaurant_json(@restaurant)
        end

        def update
          if @restaurant.update(restaurant_params)
            render json: restaurant_json(@restaurant)
          else
            render json: { error: @restaurant.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        end

        private

        def restaurant_params
          params.require(:restaurant).permit(
            :name, :phone, :email, :address, :description,
            :primary_color, :secondary_color, :accent_color,
            :font_family, :logo_url,
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
            hours: restaurant.hours || {},
            branding: {
              primary_color: restaurant.primary_color,
              secondary_color: restaurant.secondary_color,
              accent_color: restaurant.accent_color,
              font_family: restaurant.font_family,
              logo_url: restaurant.logo_url
            },
            active: restaurant.active
          }
        end
      end
    end
  end
end
