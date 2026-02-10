# Keep Action Mailer in test mode. Transactional delivery uses Resend API via EmailService.
Rails.application.config.action_mailer.delivery_method = :test

Rails.application.config.action_mailer.default_url_options = {
  host: ENV.fetch("APP_HOST", "localhost"),
  port: ENV.fetch("APP_PORT", 3001)
}
