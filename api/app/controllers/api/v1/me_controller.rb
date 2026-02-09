# frozen_string_literal: true

module Api
  module V1
    class MeController < ApplicationController
      include ClerkAuthenticatable

      before_action :authenticate_user!

      # GET /api/v1/me
      # Returns the current authenticated user
      def show
        render json: {
          user: current_user.as_json(
            only: [ :id, :email, :first_name, :last_name, :role, :restaurant_id ],
            methods: [ :full_name, :is_admin, :is_staff ]
          ),
          restaurant: current_user.restaurant&.as_json(
            only: [ :id, :name, :slug ]
          )
        }
      end
    end
  end
end
