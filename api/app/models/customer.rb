class Customer < ApplicationRecord
  belongs_to :restaurant
  has_many :orders, dependent: :nullify

  validates :name, presence: true
  validates :email, presence: true,
            format: { with: URI::MailTo::EMAIL_REGEXP },
            uniqueness: { scope: :restaurant_id, case_sensitive: false }

  before_save :downcase_email

  private

  def downcase_email
    self.email = email.downcase.strip
  end
end
