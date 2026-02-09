Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Current user endpoint
      get "me", to: "me#show"

      resources :restaurants, param: :slug, only: [ :show, :create ] do
        resource :menu, only: [ :show ], controller: "menus"
        resources :orders, only: [ :create, :show ] do
          member do
            post :pay
            post :reorder
          end
        end
        resources :customers, only: [ :create ] do
          member do
            get :orders
          end
        end
        member do
          post :setup
        end
      end

      # Admin namespace
      namespace :admin do
        resource :restaurant, only: [ :show, :update ]
        resources :users, only: [ :index, :show, :create, :update, :destroy ]
        resources :orders, only: [ :index, :update ] do
          member do
            post :notify_ready
          end
        end

        # Stripe Connect
        post "stripe/connect", to: "stripe#connect"
        get "stripe/status", to: "stripe#status"

        resources :categories, only: [ :index, :create, :update, :destroy ] do
          collection do
            patch :reorder
          end
        end
        resources :menu_items, only: [ :create, :update, :destroy ] do
          collection do
            patch :reorder
          end
        end
        resources :modifier_groups, only: [ :create, :update, :destroy ]
        resources :modifiers, only: [ :create, :update, :destroy ]

        # Promotions
        resources :promotions, only: [ :index, :create, :update, :destroy ]

        # Analytics
        get "analytics/overview", to: "analytics#overview"
        get "analytics/revenue", to: "analytics#revenue"
        get "analytics/items", to: "analytics#items"
        get "analytics/hours", to: "analytics#hours"
      end
    end
  end

  # Health check
  get "up", to: "rails/health#show", as: :rails_health_check
end
