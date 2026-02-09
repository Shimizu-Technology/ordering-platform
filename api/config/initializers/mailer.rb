# Configure Action Mailer with SMTP from environment variables
if ENV["SMTP_HOST"].present?
  Rails.application.config.action_mailer.delivery_method = :smtp
  Rails.application.config.action_mailer.smtp_settings = {
    address: ENV["SMTP_HOST"],
    port: ENV.fetch("SMTP_PORT", 587).to_i,
    user_name: ENV["SMTP_USERNAME"],
    password: ENV["SMTP_PASSWORD"],
    authentication: :plain,
    enable_starttls_auto: true
  }
else
  Rails.application.config.action_mailer.delivery_method = :test
end

Rails.application.config.action_mailer.default_url_options = {
  host: ENV.fetch("APP_HOST", "localhost"),
  port: ENV.fetch("APP_PORT", 3001)
}
