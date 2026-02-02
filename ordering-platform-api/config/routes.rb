Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :restaurants, param: :slug, only: [:show] do
        resource :menu, only: [:show], controller: "menus"
        resources :orders, only: [:create, :show] do
          member do
            post :pay
          end
        end
      end

      # Admin namespace
      namespace :admin do
        resource :restaurant, only: [:show, :update]
        resources :orders, only: [:index, :update]
        resources :categories, only: [:index, :create, :update, :destroy] do
          collection do
            patch :reorder
          end
        end
        resources :menu_items, only: [:create, :update, :destroy] do
          collection do
            patch :reorder
          end
        end
        resources :modifier_groups, only: [:create, :update, :destroy]
        resources :modifiers, only: [:create, :update, :destroy]
      end
    end
  end

  # Health check
  get "up", to: "rails/health#show", as: :rails_health_check
end
