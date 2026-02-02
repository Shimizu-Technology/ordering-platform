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
    end
  end

  # Health check
  get "up", to: "rails/health#show", as: :rails_health_check
end
