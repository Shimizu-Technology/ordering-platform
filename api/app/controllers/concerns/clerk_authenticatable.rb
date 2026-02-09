# frozen_string_literal: true

# Provides Clerk JWT authentication for controllers.
#
# Usage in controllers:
#   before_action :authenticate_user!     # Require auth
#   before_action :require_admin!         # Require admin role
#   before_action :require_staff!         # Require any staff role
#
# Access current user:
#   current_user  # Returns User or nil
module ClerkAuthenticatable
  extend ActiveSupport::Concern

  private

  # Require authentication - renders 401 if not authenticated
  def authenticate_user!
    header = request.headers["Authorization"]

    unless header.present?
      render_unauthorized("Missing authorization header")
      return
    end

    token = header.split(" ").last
    decoded = ClerkAuth.verify(token)

    unless decoded
      render_unauthorized("Invalid or expired token")
      return
    end

    # Extract user info from the token
    clerk_id = decoded["sub"]
    email = decoded["email"] || decoded["primary_email_address"]
    first_name = decoded["first_name"]
    last_name = decoded["last_name"]

    # Find or create user (invite-only pattern)
    @current_user = find_or_link_user(
      clerk_id: clerk_id,
      email: email,
      first_name: first_name,
      last_name: last_name
    )

    unless @current_user
      render_unauthorized("User not authorized. Contact an administrator.")
    end
  end

  # Optional authentication - sets current_user if token present
  def authenticate_user_optional
    header = request.headers["Authorization"]
    return unless header.present?

    token = header.split(" ").last
    decoded = ClerkAuth.verify(token)
    return unless decoded

    clerk_id = decoded["sub"]
    @current_user = User.find_by(clerk_id: clerk_id)
  end

  def current_user
    @current_user
  end

  # Require admin role
  def require_admin!
    authenticate_user! unless @current_user
    return if performed?

    unless @current_user&.admin?
      render_forbidden("Admin access required")
    end
  end

  # Require any staff role
  def require_staff!
    authenticate_user! unless @current_user
    return if performed?

    unless @current_user&.staff?
      render_forbidden("Staff access required")
    end
  end

  # Require user can manage the current restaurant
  def require_restaurant_access!
    authenticate_user! unless @current_user
    return if performed?

    unless @current_user&.can_manage?(@restaurant)
      render_forbidden("You don't have access to this restaurant")
    end
  end

  private

  # Find existing user by clerk_id, or link to invited user by email
  def find_or_link_user(clerk_id:, email:, first_name:, last_name:)
    return nil if clerk_id.blank?

    # First try to find by clerk_id (returning user)
    user = User.find_by(clerk_id: clerk_id)

    if user
      # Update profile info if changed
      updates = {}
      updates[:email] = email if email.present? && email != user.email
      updates[:first_name] = first_name if first_name.present? && first_name != user.first_name
      updates[:last_name] = last_name if last_name.present? && last_name != user.last_name
      user.update(updates) if updates.any?
      return user
    end

    # Try to find by email (invited user signing in for first time)
    if email.present?
      user = User.find_by("LOWER(email) = ?", email.downcase)

      if user && user.clerk_id.start_with?("pending_")
        # Link the Clerk ID to this invited user
        user.update(
          clerk_id: clerk_id,
          first_name: first_name.presence || user.first_name,
          last_name: last_name.presence || user.last_name
        )
        return user
      end
    end

    # SPECIAL CASE: First user ever = auto-create as super_admin
    if User.count.zero?
      user_email = email.presence || "#{clerk_id}@placeholder.local"
      return User.create(
        clerk_id: clerk_id,
        email: user_email,
        first_name: first_name,
        last_name: last_name,
        role: "super_admin"
      )
    end

    # User not invited - return nil (will trigger 401)
    nil
  end

  def render_unauthorized(message = "Unauthorized")
    render json: { error: message }, status: :unauthorized
  end

  def render_forbidden(message = "Forbidden")
    render json: { error: message }, status: :forbidden
  end
end
