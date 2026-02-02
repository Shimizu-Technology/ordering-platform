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

ActiveRecord::Schema[8.1].define(version: 2026_02_02_210528) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

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
    t.bigint "menu_category_id", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["menu_category_id"], name: "index_menu_items_on_menu_category_id"
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
    t.string "customer_name", null: false
    t.string "email"
    t.string "order_type", default: "pickup", null: false
    t.string "phone"
    t.bigint "restaurant_id", null: false
    t.text "special_instructions"
    t.string "status", default: "pending", null: false
    t.string "stripe_payment_intent_id"
    t.decimal "total", precision: 10, scale: 2, default: "0.0", null: false
    t.datetime "updated_at", null: false
    t.index ["restaurant_id"], name: "index_orders_on_restaurant_id"
    t.index ["status"], name: "index_orders_on_status"
    t.index ["stripe_payment_intent_id"], name: "index_orders_on_stripe_payment_intent_id", unique: true
  end

  create_table "restaurants", force: :cascade do |t|
    t.string "accent_color"
    t.boolean "active", default: true, null: false
    t.string "address"
    t.datetime "created_at", null: false
    t.jsonb "default_order_type", default: "pickup"
    t.text "description"
    t.string "email"
    t.string "font_family"
    t.jsonb "hours"
    t.string "logo_url"
    t.string "name"
    t.string "phone"
    t.string "primary_color"
    t.string "secondary_color"
    t.string "slug"
    t.string "stripe_account_id"
    t.string "subdomain"
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_restaurants_on_slug", unique: true
  end

  add_foreign_key "menu_categories", "restaurants"
  add_foreign_key "menu_items", "menu_categories"
  add_foreign_key "modifier_groups", "menu_items"
  add_foreign_key "modifiers", "modifier_groups"
  add_foreign_key "order_item_modifiers", "modifiers"
  add_foreign_key "order_item_modifiers", "order_items"
  add_foreign_key "order_items", "menu_items"
  add_foreign_key "order_items", "orders"
  add_foreign_key "orders", "restaurants"
end
