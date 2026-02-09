# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_09_104851) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "catering_inquiries", force: :cascade do |t|
    t.text "admin_notes"
    t.string "budget_range"
    t.string "company_name"
    t.string "contact_email", null: false
    t.string "contact_name", null: false
    t.string "contact_phone"
    t.datetime "created_at", null: false
    t.text "dietary_restrictions"
    t.date "event_date", null: false
    t.string "event_time"
    t.string "event_type", null: false
    t.integer "guest_count", null: false
    t.bigint "location_id"
    t.text "menu_preferences"
    t.decimal "quoted_amount", precision: 10, scale: 2
    t.datetime "quoted_at"
    t.bigint "responded_by_id"
    t.bigint "restaurant_id", null: false
    t.text "special_requests"
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.text "venue_address"
    t.index ["event_date"], name: "index_catering_inquiries_on_event_date"
    t.index ["location_id"], name: "index_catering_inquiries_on_location_id"
    t.index ["responded_by_id"], name: "index_catering_inquiries_on_responded_by_id"
    t.index ["restaurant_id"], name: "index_catering_inquiries_on_restaurant_id"
    t.index ["status"], name: "index_catering_inquiries_on_status"
  end

  create_table "customers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.string "phone"
    t.bigint "restaurant_id", null: false
    t.datetime "updated_at", null: false
    t.index ["restaurant_id", "email"], name: "index_customers_on_restaurant_id_and_email", unique: true
    t.index ["restaurant_id"], name: "index_customers_on_restaurant_id"
  end

  create_table "locations", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "address"
    t.datetime "created_at", null: false
    t.string "email"
    t.jsonb "hours", default: {}
    t.string "name", null: false
    t.string "phone"
    t.integer "position", default: 0, null: false
    t.bigint "restaurant_id", null: false
    t.string "slug", null: false
    t.datetime "updated_at", null: false
    t.index ["restaurant_id", "slug"], name: "index_locations_on_restaurant_id_and_slug", unique: true
    t.index ["restaurant_id"], name: "index_locations_on_restaurant_id"
  end

  create_table "menu_categories", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.bigint "restaurant_id", null: false
    t.datetime "updated_at", null: false
    t.index ["restaurant_id"], name: "index_menu_categories_on_restaurant_id"
  end

  create_table "menu_items", force: :cascade do |t|
    t.boolean "available", default: true, null: false
    t.decimal "base_price", precision: 8, scale: 2, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "image_url"
    t.integer "low_stock_threshold", default: 5
    t.bigint "menu_category_id", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.integer "stock_quantity"
    t.boolean "track_inventory", default: false, null: false
    t.datetime "updated_at", null: false
    t.index ["menu_category_id"], name: "index_menu_items_on_menu_category_id"
  end

  create_table "merchandise_categories", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.bigint "restaurant_id", null: false
    t.datetime "updated_at", null: false
    t.index ["restaurant_id"], name: "index_merchandise_categories_on_restaurant_id"
  end

  create_table "merchandise_items", force: :cascade do |t|
    t.boolean "available", default: true, null: false
    t.decimal "base_price", precision: 8, scale: 2
    t.datetime "created_at", null: false
    t.text "description"
    t.string "image_url"
    t.bigint "merchandise_category_id", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["merchandise_category_id"], name: "index_merchandise_items_on_merchandise_category_id"
  end

  create_table "merchandise_variants", force: :cascade do |t|
    t.boolean "available", default: true, null: false
    t.datetime "created_at", null: false
    t.integer "low_stock_threshold", default: 5
    t.bigint "merchandise_item_id", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.decimal "price", precision: 8, scale: 2, null: false
    t.string "sku"
    t.integer "stock_quantity", default: 0, null: false
    t.boolean "track_inventory", default: true, null: false
    t.datetime "updated_at", null: false
    t.index ["merchandise_item_id"], name: "index_merchandise_variants_on_merchandise_item_id"
    t.index ["sku"], name: "index_merchandise_variants_on_sku", unique: true, where: "(sku IS NOT NULL)"
  end

  create_table "modifier_groups", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "max_select"
    t.bigint "menu_item_id", null: false
    t.integer "min_select", default: 0, null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.boolean "required", default: false, null: false
    t.datetime "updated_at", null: false
    t.index ["menu_item_id"], name: "index_modifier_groups_on_menu_item_id"
  end

  create_table "modifiers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "default_selected", default: false, null: false
    t.bigint "modifier_group_id", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.decimal "price_adjustment", precision: 8, scale: 2, default: "0.0", null: false
    t.datetime "updated_at", null: false
    t.index ["modifier_group_id"], name: "index_modifiers_on_modifier_group_id"
  end

  create_table "order_item_modifiers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "modifier_id", null: false
    t.bigint "order_item_id", null: false
    t.decimal "price_adjustment", precision: 8, scale: 2, default: "0.0", null: false
    t.datetime "updated_at", null: false
    t.index ["modifier_id"], name: "index_order_item_modifiers_on_modifier_id"
    t.index ["order_item_id"], name: "index_order_item_modifiers_on_order_item_id"
  end

  create_table "order_items", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "menu_item_id", null: false
    t.bigint "order_id", null: false
    t.integer "quantity", default: 1, null: false
    t.text "special_instructions"
    t.decimal "subtotal", precision: 10, scale: 2, null: false
    t.decimal "unit_price", precision: 8, scale: 2, null: false
    t.datetime "updated_at", null: false
    t.index ["menu_item_id"], name: "index_order_items_on_menu_item_id"
    t.index ["order_id"], name: "index_order_items_on_order_id"
  end

  create_table "orders", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "customer_id"
    t.string "customer_name", null: false
    t.string "email"
    t.string "idempotency_key"
    t.bigint "location_id"
    t.integer "lock_version", default: 0, null: false
    t.string "order_type", default: "pickup", null: false
    t.string "phone"
    t.string "refund_status"
    t.decimal "refunded_amount", precision: 10, scale: 2, default: "0.0", null: false
    t.bigint "restaurant_id", null: false
    t.text "special_instructions"
    t.string "status", default: "pending", null: false
    t.string "stripe_payment_intent_id"
    t.decimal "subtotal", precision: 10, scale: 2, default: "0.0", null: false
    t.decimal "tip_amount", precision: 10, scale: 2, default: "0.0", null: false
    t.integer "tip_percentage"
    t.decimal "total", precision: 10, scale: 2, default: "0.0", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_orders_on_customer_id"
    t.index ["idempotency_key"], name: "index_orders_on_idempotency_key", unique: true, where: "(idempotency_key IS NOT NULL)"
    t.index ["location_id"], name: "index_orders_on_location_id"
    t.index ["restaurant_id"], name: "index_orders_on_restaurant_id"
    t.index ["status"], name: "index_orders_on_status"
    t.index ["stripe_payment_intent_id"], name: "index_orders_on_stripe_payment_intent_id", unique: true
  end

  create_table "promotions", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "applies_to", default: "all", null: false
    t.bigint "applies_to_id"
    t.datetime "created_at", null: false
    t.jsonb "days_of_week", default: [], null: false
    t.time "end_time", null: false
    t.string "name", null: false
    t.string "promotion_type", null: false
    t.bigint "restaurant_id", null: false
    t.time "start_time", null: false
    t.datetime "updated_at", null: false
    t.decimal "value", precision: 8, scale: 2, null: false
    t.index ["applies_to"], name: "index_promotions_on_applies_to"
    t.index ["restaurant_id", "active"], name: "index_promotions_on_restaurant_id_and_active"
    t.index ["restaurant_id"], name: "index_promotions_on_restaurant_id"
  end

  create_table "refunds", force: :cascade do |t|
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.text "error_message"
    t.text "notes"
    t.bigint "order_id", null: false
    t.string "reason", null: false
    t.string "refund_type", null: false
    t.boolean "restore_inventory", default: true, null: false
    t.string "status", default: "pending", null: false
    t.string "stripe_payment_intent_id"
    t.string "stripe_refund_id"
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["created_at"], name: "index_refunds_on_created_at"
    t.index ["order_id"], name: "index_refunds_on_order_id"
    t.index ["status"], name: "index_refunds_on_status"
    t.index ["stripe_refund_id"], name: "index_refunds_on_stripe_refund_id", unique: true
    t.index ["user_id"], name: "index_refunds_on_user_id"
  end

  create_table "restaurants", force: :cascade do |t|
    t.string "accent_color"
    t.boolean "active", default: true, null: false
    t.string "address"
    t.datetime "created_at", null: false
    t.jsonb "default_order_type", default: "pickup"
    t.text "description"
    t.string "email"
    t.jsonb "features", default: {"pos"=>false, "rewards"=>false, "catering"=>false, "merchandise"=>false, "multi_location"=>false}, null: false
    t.string "font_family"
    t.jsonb "hours"
    t.string "logo_url"
    t.string "name"
    t.boolean "notifications_enabled", default: false, null: false
    t.string "phone"
    t.string "primary_color"
    t.string "secondary_color"
    t.string "slug"
    t.string "status", default: "active", null: false
    t.string "stripe_account_id"
    t.boolean "stripe_onboarding_complete", default: false, null: false
    t.string "stripe_publishable_key"
    t.string "stripe_secret_key"
    t.string "stripe_webhook_secret"
    t.string "subdomain"
    t.datetime "updated_at", null: false
    t.string "webhook_url"
    t.index ["slug"], name: "index_restaurants_on_slug", unique: true
    t.index ["status"], name: "index_restaurants_on_status"
  end

  create_table "stock_adjustments", force: :cascade do |t|
    t.bigint "adjustable_id", null: false
    t.string "adjustable_type", null: false
    t.integer "adjustment", null: false
    t.datetime "created_at", null: false
    t.bigint "location_id"
    t.text "notes"
    t.integer "quantity_after", null: false
    t.integer "quantity_before", null: false
    t.string "reason", null: false
    t.bigint "reference_id"
    t.string "reference_type"
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["adjustable_type", "adjustable_id"], name: "idx_stock_adj_adjustable"
    t.index ["created_at"], name: "index_stock_adjustments_on_created_at"
    t.index ["location_id"], name: "index_stock_adjustments_on_location_id"
    t.index ["reason"], name: "index_stock_adjustments_on_reason"
    t.index ["reference_type", "reference_id"], name: "idx_stock_adj_reference"
    t.index ["user_id"], name: "index_stock_adjustments_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "clerk_id", null: false
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "first_name"
    t.string "last_name"
    t.bigint "restaurant_id"
    t.string "role", default: "staff", null: false
    t.datetime "updated_at", null: false
    t.index ["clerk_id"], name: "index_users_on_clerk_id", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["restaurant_id", "role"], name: "index_users_on_restaurant_id_and_role"
    t.index ["restaurant_id"], name: "index_users_on_restaurant_id"
  end

  add_foreign_key "catering_inquiries", "locations"
  add_foreign_key "catering_inquiries", "restaurants"
  add_foreign_key "catering_inquiries", "users", column: "responded_by_id"
  add_foreign_key "customers", "restaurants"
  add_foreign_key "locations", "restaurants"
  add_foreign_key "menu_categories", "restaurants"
  add_foreign_key "menu_items", "menu_categories"
  add_foreign_key "merchandise_categories", "restaurants"
  add_foreign_key "merchandise_items", "merchandise_categories"
  add_foreign_key "merchandise_variants", "merchandise_items"
  add_foreign_key "modifier_groups", "menu_items"
  add_foreign_key "modifiers", "modifier_groups"
  add_foreign_key "order_item_modifiers", "modifiers"
  add_foreign_key "order_item_modifiers", "order_items"
  add_foreign_key "order_items", "menu_items"
  add_foreign_key "order_items", "orders"
  add_foreign_key "orders", "customers"
  add_foreign_key "orders", "locations"
  add_foreign_key "orders", "restaurants"
  add_foreign_key "promotions", "restaurants"
  add_foreign_key "refunds", "orders"
  add_foreign_key "refunds", "users"
  add_foreign_key "stock_adjustments", "locations"
  add_foreign_key "stock_adjustments", "users"
  add_foreign_key "users", "restaurants"
end
