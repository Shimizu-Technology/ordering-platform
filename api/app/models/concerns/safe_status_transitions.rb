# frozen_string_literal: true

# Provides safe status transitions with race condition protection.
#
# Uses:
# 1. Optimistic locking (lock_version column) to prevent concurrent updates
# 2. Database transactions with row-level locking for critical operations
# 3. Defined transition rules to prevent invalid state changes
#
# Include this in models that have a `status` column.
module SafeStatusTransitions
  extend ActiveSupport::Concern

  class InvalidTransitionError < StandardError; end
  class ConcurrentModificationError < StandardError; end

  included do
    # Optimistic locking - Rails will raise ActiveRecord::StaleObjectError
    # if another process updated the record between read and write
  end

  # Safely transition status with optimistic locking
  #
  # @param new_status [String] The target status
  # @param allowed_from [Array<String>] Valid source statuses (nil = any)
  # @return [Boolean] true if transition succeeded
  # @raise [InvalidTransitionError] if transition not allowed
  # @raise [ConcurrentModificationError] if record was modified concurrently
  def transition_status!(new_status, allowed_from: nil)
    transaction do
      # Lock the row for update to prevent concurrent modifications
      reload(lock: true)

      # Validate transition is allowed
      if allowed_from.present? && !allowed_from.include?(status)
        raise InvalidTransitionError,
              "Cannot transition from '#{status}' to '#{new_status}'. " \
              "Allowed from: #{allowed_from.join(', ')}"
      end

      self.status = new_status
      save!
    end
  rescue ActiveRecord::StaleObjectError
    raise ConcurrentModificationError,
          "Order was modified by another process. Please refresh and try again."
  end

  # Check if a transition is valid without performing it
  def can_transition_to?(new_status, allowed_from: nil)
    return true if allowed_from.nil?

    allowed_from.include?(status)
  end
end
