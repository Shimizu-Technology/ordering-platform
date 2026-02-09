# frozen_string_literal: true

module Api
  module V1
    module Admin
      # Admin endpoints for managing catering inquiries.
      class CateringController < BaseController
        before_action :set_inquiry, only: %i[show update quote]

        # GET /api/v1/admin/catering
        def index
          inquiries = current_restaurant.catering_inquiries

          # Filter by status
          if params[:status].present?
            inquiries = inquiries.where(status: params[:status])
          end

          # Default to active inquiries
          inquiries = params[:all] ? inquiries.recent : inquiries.active.upcoming

          render json: {
            inquiries: inquiries.map { |i| inquiry_json(i) },
            counts: {
              pending: current_restaurant.catering_inquiries.pending.count,
              quoted: current_restaurant.catering_inquiries.quoted.count,
              upcoming: current_restaurant.catering_inquiries.active.upcoming.count
            }
          }
        end

        # GET /api/v1/admin/catering/:id
        def show
          render json: inquiry_json(@inquiry, full: true)
        end

        # PATCH /api/v1/admin/catering/:id
        def update
          if @inquiry.update(update_params)
            render json: inquiry_json(@inquiry, full: true)
          else
            render json: { errors: @inquiry.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # POST /api/v1/admin/catering/:id/quote
        def quote
          amount = params[:quoted_amount].to_d
          notes = params[:admin_notes]

          if amount <= 0
            render json: { error: "Quote amount must be positive" }, status: :unprocessable_entity
            return
          end

          @inquiry.mark_quoted!(amount: amount, admin: current_user, notes: notes)

          # TODO: Send quote email to customer

          render json: {
            message: "Quote sent successfully",
            inquiry: inquiry_json(@inquiry, full: true)
          }
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        private

        def set_inquiry
          @inquiry = current_restaurant.catering_inquiries.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Inquiry not found" }, status: :not_found
        end

        def update_params
          params.permit(:status, :admin_notes, :location_id)
        end

        def inquiry_json(inquiry, full: false)
          base = {
            id: inquiry.id,
            contact_name: inquiry.contact_name,
            contact_email: inquiry.contact_email,
            contact_phone: inquiry.contact_phone,
            company_name: inquiry.company_name,
            event_type: inquiry.event_type,
            event_date: inquiry.event_date,
            event_time: inquiry.event_time,
            guest_count: inquiry.guest_count,
            budget_range: inquiry.budget_range,
            status: inquiry.status,
            quoted_amount: inquiry.quoted_amount&.to_f,
            quoted_at: inquiry.quoted_at&.iso8601,
            days_until_event: inquiry.days_until_event,
            urgent: inquiry.urgent?,
            created_at: inquiry.created_at.iso8601
          }

          if full
            base.merge!(
              venue_address: inquiry.venue_address,
              menu_preferences: inquiry.menu_preferences,
              special_requests: inquiry.special_requests,
              dietary_restrictions: inquiry.dietary_restrictions,
              admin_notes: inquiry.admin_notes,
              location: inquiry.location ? {
                id: inquiry.location.id,
                name: inquiry.location.name
              } : nil,
              responded_by: inquiry.responded_by ? {
                id: inquiry.responded_by.id,
                name: inquiry.responded_by.name
              } : nil
            )
          end

          base
        end
      end
    end
  end
end
