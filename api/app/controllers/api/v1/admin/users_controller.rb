# frozen_string_literal: true

module Api
  module V1
    module Admin
      class UsersController < BaseController
        before_action :require_admin!, only: [ :create, :update, :destroy ]
        before_action :set_user, only: [ :show, :update, :destroy ]

        # GET /api/v1/admin/restaurants/:restaurant_slug/users
        def index
          @users = @restaurant.users.order(:created_at)
          render json: { users: @users.as_json(methods: [ :full_name, :is_admin, :is_staff ]) }
        end

        # GET /api/v1/admin/restaurants/:restaurant_slug/users/:id
        def show
          render json: { user: @user.as_json(methods: [ :full_name, :is_admin, :is_staff ]) }
        end

        # POST /api/v1/admin/restaurants/:restaurant_slug/users
        # Invite a new user (creates with pending clerk_id)
        def create
          @user = @restaurant.users.new(user_params)
          @user.clerk_id = "pending_#{SecureRandom.uuid}"

          if @user.save
            # TODO: Send invitation email
            render json: { user: @user.as_json(methods: [ :full_name, :is_admin, :is_staff ]) }, status: :created
          else
            render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # PATCH /api/v1/admin/restaurants/:restaurant_slug/users/:id
        def update
          if @user.update(user_params)
            render json: { user: @user.as_json(methods: [ :full_name, :is_admin, :is_staff ]) }
          else
            render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # DELETE /api/v1/admin/restaurants/:restaurant_slug/users/:id
        def destroy
          @user.destroy
          head :no_content
        end

        private

        def set_user
          @user = @restaurant.users.find(params[:id])
        end

        def user_params
          params.require(:user).permit(:email, :first_name, :last_name, :role)
        end
      end
    end
  end
end
