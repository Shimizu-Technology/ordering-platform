module Api
  module V1
    module Admin
      class PromotionsController < BaseController
        before_action :set_promotion, only: [ :update, :destroy ]

        def index
          promotions = @restaurant.promotions.order(created_at: :desc)
          render json: promotions.map { |p| promotion_json(p) }
        end

        def create
          promotion = @restaurant.promotions.build(promotion_params)

          if promotion.save
            render json: promotion_json(promotion), status: :created
          else
            render json: { errors: promotion.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @promotion.update(promotion_params)
            render json: promotion_json(@promotion)
          else
            render json: { errors: @promotion.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @promotion.destroy!
          head :no_content
        end

        private

        def set_promotion
          @promotion = @restaurant.promotions.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Promotion not found" }, status: :not_found
        end

        def promotion_params
          params.require(:promotion).permit(
            :name, :promotion_type, :value, :start_time, :end_time,
            :active, :applies_to, :applies_to_id, days_of_week: []
          )
        end

        def promotion_json(promo)
          {
            id: promo.id,
            name: promo.name,
            promotion_type: promo.promotion_type,
            value: promo.value.to_f,
            start_time: promo.start_time.strftime("%H:%M"),
            end_time: promo.end_time.strftime("%H:%M"),
            days_of_week: promo.days_of_week,
            active: promo.active,
            applies_to: promo.applies_to,
            applies_to_id: promo.applies_to_id,
            currently_active: promo.currently_active?,
            created_at: promo.created_at,
            updated_at: promo.updated_at
          }
        end
      end
    end
  end
end
