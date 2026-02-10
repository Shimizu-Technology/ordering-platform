Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    localhost_origin_patterns = [
      %r{\Ahttp://localhost:\d+\z},
      %r{\Ahttp://127\.0\.0\.1:\d+\z}
    ]

    origins(
      "http://localhost:5173",    # Vite dev server (HavaJava)
      "http://localhost:5174",    # Vite dev server (Three Squares)
      "http://localhost:4173",    # Vite preview (HavaJava)
      "http://localhost:4174",    # Vite preview (Three Squares)
      "http://localhost:3000",    # Alt dev
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:4173",
      "http://127.0.0.1:4174",
      *localhost_origin_patterns,
      *ENV.fetch("ALLOWED_ORIGINS", "").split(",").map(&:strip)
    )

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      credentials: false,
      max_age: 3600
  end
end
