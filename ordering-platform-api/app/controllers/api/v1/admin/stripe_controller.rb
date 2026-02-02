module Api
  module V1
    module Admin
      class StripeController < BaseController
        def connect
          unless StripeConnectService.configured?
            return render json: { error: "Stripe is not configured" }, status: :service_unavailable
          end

          if @restaurant.stripe_account_id.present? && @restaurant.stripe_onboarding_complete
            return render json: { error: "Restaurant already has a connected Stripe account" }, status: :unprocessable_entity
          end

          return_url = params[:return_url] || "#{request.base_url}/admin"
          refresh_url = params[:refresh_url] || "#{request.base_url}/admin"

          result = StripeConnectService.create_account(
            @restaurant,
            return_url: return_url,
            refresh_url: refresh_url
          )

          if result[:success]
            render json: { url: result[:url], account_id: result[:account_id] }
          else
            render json: { error: result[:error] }, status: :unprocessable_entity
          end
        end

        def status
          result = StripeConnectService.check_status(@restaurant)
          render json: result
        end
      end
    end
  end
end
