module Api
  module V1
    class CustomersController < BaseController
      # POST /api/v1/restaurants/:slug/customers
      # Create or lookup customer by email
      def create
        email = customer_params[:email]&.downcase&.strip

        unless email.present?
          return render json: { error: "Email is required" }, status: :unprocessable_entity
        end

        customer = @restaurant.customers.find_by(email: email)

        if customer
          # Update name/phone if provided
          customer.update(
            name: customer_params[:name].presence || customer.name,
            phone: customer_params[:phone].presence || customer.phone
          )
        else
          customer = @restaurant.customers.create!(
            name: customer_params[:name] || "Guest",
            email: email,
            phone: customer_params[:phone]
          )
        end

        render json: customer_json(customer), status: customer.previously_new_record? ? :created : :ok
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # GET /api/v1/restaurants/:slug/customers/:id/orders
      def orders
        customer = @restaurant.customers.find(params[:id])
        orders = customer.orders
          .includes(order_items: [:menu_item, { order_item_modifiers: :modifier }])
          .order(created_at: :desc)

        render json: {
          customer: customer_json(customer),
          orders: orders.map { |o| order_json(o) }
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Customer not found" }, status: :not_found
      end

      private

      def customer_params
        params.require(:customer).permit(:name, :email, :phone)
      end

      def customer_json(customer)
        {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          created_at: customer.created_at.iso8601
        }
      end

      def order_json(order)
        {
          id: order.id,
          customer_name: order.customer_name,
          order_type: order.order_type,
          status: order.status,
          total: order.total.to_f,
          special_instructions: order.special_instructions,
          created_at: order.created_at.iso8601,
          items: order.order_items.map do |item|
            {
              id: item.id,
              menu_item_name: item.menu_item.name,
              menu_item_id: item.menu_item_id,
              quantity: item.quantity,
              unit_price: item.unit_price.to_f,
              subtotal: item.subtotal.to_f,
              special_instructions: item.special_instructions,
              modifiers: item.order_item_modifiers.map do |oim|
                {
                  name: oim.modifier.name,
                  price_adjustment: oim.price_adjustment.to_f
                }
              end
            }
          end
        }
      end
    end
  end
end
