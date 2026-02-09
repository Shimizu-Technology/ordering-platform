# frozen_string_literal: true

module Api
  module V1
    # Public endpoint for submitting catering inquiries.
    class CateringController < ApplicationController
      before_action :set_restaurant

      # POST /api/v1/restaurants/:restaurant_slug/catering
      def create
        inquiry = @restaurant.catering_inquiries.build(inquiry_params)

        if inquiry.save
          # TODO: Send notification email to restaurant
          # TODO: Send confirmation email to customer
          render json: {
            message: "Thank you! We'll get back to you within 24-48 hours.",
            inquiry: inquiry_json(inquiry)
          }, status: :created
        else
          render json: { errors: inquiry.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/restaurants/:restaurant_slug/catering/info
      def info
        render json: {
          event_types: CateringInquiry::EVENT_TYPES,
          budget_ranges: CateringInquiry::BUDGET_RANGES,
          minimum_lead_days: 3,
          locations: @restaurant.locations.active.ordered.map { |l|
            { id: l.id, name: l.name, address: l.address }
          }
        }
      end

      private

      def set_restaurant
        @restaurant = Restaurant.active.find_by!(slug: params[:restaurant_slug])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Restaurant not found" }, status: :not_found
      end

      def inquiry_params
        params.require(:inquiry).permit(
          :contact_name, :contact_email, :contact_phone, :company_name,
          :event_type, :event_date, :event_time, :guest_count,
          :budget_range, :venue_address, :menu_preferences,
          :special_requests, :dietary_restrictions, :location_id
        )
      end

      def inquiry_json(inquiry)
        {
          id: inquiry.id,
          contact_name: inquiry.contact_name,
          event_type: inquiry.event_type,
          event_date: inquiry.event_date,
          guest_count: inquiry.guest_count,
          status: inquiry.status,
          created_at: inquiry.created_at.iso8601
        }
      end
    end
  end
end
