puts "Seeding ordering platform..."

# ============================================================================
# RESTAURANT: HavaJava 671 Café
# ============================================================================
havajava = Restaurant.find_or_create_by!(slug: "havajava") do |r|
  r.name = "HavaJava 671 Café"
  r.phone = "671-477-0600"
  r.address = "148 Aspinall Ave Suite 102, Hagåtña, Guam 96910"
  r.description = "Hagåtña's favorite coffee shop since 1995. Serving Lavazza espresso, fresh sandwiches, pastries, and ice-blended drinks."
  r.hours = {
    monday:    { open: "06:30", close: "16:30" },
    tuesday:   { open: "06:30", close: "16:30" },
    wednesday: { open: "06:30", close: "20:00" },
    thursday:  { open: "06:30", close: "20:00" },
    friday:    { open: "06:30", close: "16:30" },
    saturday:  { open: "07:00", close: "14:30" },
    sunday:    { closed: true }
  }
  r.primary_color = "#2D5016"
  r.secondary_color = "#F5F0E8"
  r.accent_color = "#8B4513"
  r.font_family = "DM Sans"
  r.active = true
end

puts "  Created restaurant: #{havajava.name}"

# Helper to create items with modifiers
def create_item(category, name, description, price, position, &block)
  item = category.menu_items.find_or_create_by!(name: name) do |mi|
    mi.description = description
    mi.base_price = price
    mi.position = position
    mi.available = true
  end
  yield(item) if block_given?
  item
end

def add_size_modifiers(item, tall_price, grande_price, position: 0)
  group = item.modifier_groups.find_or_create_by!(name: "Size") do |mg|
    mg.required = true
    mg.min_select = 1
    mg.max_select = 1
    mg.position = position
  end
  group.modifiers.find_or_create_by!(name: "Tall") do |m|
    m.price_adjustment = 0
    m.default_selected = true
    m.position = 0
  end
  group.modifiers.find_or_create_by!(name: "Grande") do |m|
    m.price_adjustment = grande_price - tall_price
    m.default_selected = false
    m.position = 1
  end
  group
end

def add_temp_modifiers(item, position: 1)
  group = item.modifier_groups.find_or_create_by!(name: "Temperature") do |mg|
    mg.required = true
    mg.min_select = 1
    mg.max_select = 1
    mg.position = position
  end
  group.modifiers.find_or_create_by!(name: "Hot") do |m|
    m.price_adjustment = 0
    m.default_selected = true
    m.position = 0
  end
  group.modifiers.find_or_create_by!(name: "Iced") do |m|
    m.price_adjustment = 0
    m.default_selected = false
    m.position = 1
  end
  group
end

# ============================================================================
# CATEGORY 1: Espresso Drinks
# ============================================================================
espresso = havajava.menu_categories.find_or_create_by!(name: "Espresso Drinks") do |c|
  c.position = 1
  c.active = true
end

espresso_drinks = [
  ["Caffè Espresso", "Rich, bold Lavazza espresso shot", 3.10, 3.65],
  ["Caffè Americano", "Espresso with hot water for a smooth, full-bodied coffee", 3.25, 3.75],
  ["Red Eye", "Drip coffee with an added shot of espresso for extra kick", 3.75, 4.25],
  ["Cappuccino", "Equal parts espresso, steamed milk, and velvety foam", 4.90, 5.40],
  ["Caffè Latte", "Espresso with steamed milk and a light layer of foam", 4.90, 5.40],
  ["Caffè Mocha", "Espresso with chocolate, steamed milk, and whipped cream", 5.25, 5.75],
  ["White Chocolate Mocha", "Espresso with white chocolate sauce and steamed milk", 5.95, 6.50],
  ["Mexican Mocha", "Espresso with chocolate, cinnamon, cayenne, and steamed milk", 5.95, 6.50],
  ["Carmella", "Espresso with caramel, steamed milk, and caramel drizzle", 5.95, 6.50],
]

espresso_drinks.each_with_index do |(name, desc, tall, grande), idx|
  create_item(espresso, name, desc, tall, idx + 1) do |item|
    add_size_modifiers(item, tall, grande)
    add_temp_modifiers(item)
  end
end

puts "  Seeded #{espresso_drinks.length} espresso drinks"

# ============================================================================
# CATEGORY 2: Ice-Blended Drinks
# ============================================================================
ice_blended = havajava.menu_categories.find_or_create_by!(name: "Ice-Blended Drinks") do |c|
  c.position = 2
  c.active = true
end

blended_drinks = [
  ["Frozen Mocha Frappé", "Blended espresso with chocolate, milk, and ice", 5.95, 6.50],
  ["Frozen Coconut Mocha Frappé", "Blended espresso with coconut, chocolate, and ice", 5.95, 6.50],
  ["Frozen White Chocolate Vanilla Frappé", "Blended espresso with white chocolate, vanilla, and ice", 5.95, 6.50],
  ["Frozen Coffee Toffee", "Blended espresso with toffee syrup, milk, and ice", 5.95, 6.50],
  ["Frozen Matcha Green Tea Frappé", "Blended matcha green tea with milk and ice", 5.95, 6.50],
  ["Frozen Chai Frappé", "Blended chai spice with milk and ice", 5.95, 6.50],
  ["Frozen Chocolate Frappé", "Blended chocolate with milk and ice — coffee-free", 5.95, 6.50],
  ["Frozen Real Fruit Smoothie", "Pick 2 real fruits blended with ice", 6.25, 6.75],
  ["Kids' Favorite Flavor Slush", "Fun fruity slush for kids", 4.25, 4.75],
]

blended_drinks.each_with_index do |(name, desc, tall, grande), idx|
  create_item(ice_blended, name, desc, tall, idx + 1) do |item|
    add_size_modifiers(item, tall, grande)

    # Smoothie gets fruit picker
    if name == "Frozen Real Fruit Smoothie"
      fruit_group = item.modifier_groups.find_or_create_by!(name: "Choose 2 Fruits") do |mg|
        mg.required = true
        mg.min_select = 2
        mg.max_select = 2
        mg.position = 1
      end
      %w[Strawberry Banana Blueberry Mango Pineapple Peach].each_with_index do |fruit, i|
        fruit_group.modifiers.find_or_create_by!(name: fruit) do |m|
          m.price_adjustment = 0
          m.default_selected = false
          m.position = i
        end
      end
    end

    # Kids' slush gets flavor picker
    if name == "Kids' Favorite Flavor Slush"
      flavor_group = item.modifier_groups.find_or_create_by!(name: "Flavor") do |mg|
        mg.required = true
        mg.min_select = 1
        mg.max_select = 1
        mg.position = 1
      end
      %w[Cherry Grape Blue\ Raspberry Watermelon Orange].each_with_index do |flavor, i|
        flavor_group.modifiers.find_or_create_by!(name: flavor) do |m|
          m.price_adjustment = 0
          m.default_selected = false
          m.position = i
        end
      end
    end
  end
end

puts "  Seeded #{blended_drinks.length} ice-blended drinks"

# ============================================================================
# CATEGORY 3: Iced Tea Coolers
# ============================================================================
iced_tea = havajava.menu_categories.find_or_create_by!(name: "Iced Tea Coolers") do |c|
  c.position = 3
  c.active = true
end

tea_coolers = [
  ["Peach Melba", "Refreshing peach iced tea cooler", 3.95, 4.45],
  ["Tropical Breeze", "Tropical fruit iced tea blend", 3.95, 4.45],
  ["Watermelon", "Sweet watermelon iced tea cooler", 3.95, 4.45],
  ["Minty Mojito", "Mint-infused iced tea cooler (non-alcoholic)", 3.95, 4.45],
  ["Calamansi", "Local calamansi citrus iced tea — island favorite", 3.95, 4.45],
]

tea_coolers.each_with_index do |(name, desc, tall, grande), idx|
  create_item(iced_tea, name, desc, tall, idx + 1) do |item|
    add_size_modifiers(item, tall, grande)
  end
end

puts "  Seeded #{tea_coolers.length} iced tea coolers"

# ============================================================================
# CATEGORY 4: Hot Beverages
# ============================================================================
hot_bev = havajava.menu_categories.find_or_create_by!(name: "Hot Beverages") do |c|
  c.position = 4
  c.active = true
end

hot_beverages = [
  ["Hot Java", "Fresh brewed Lavazza drip coffee", 3.25, 3.75],
  ["Hot Tea", "Selection of premium tea bags", 2.75, 3.25],
  ["Hot Chai Tea", "Spiced chai tea with steamed milk", 4.50, 5.00],
  ["Hot Dirty Chai", "Chai tea with a shot of espresso", 5.00, 5.50],
  ["Hot Chocolate", "Rich hot chocolate with steamed milk", 3.25, 3.75],
]

hot_beverages.each_with_index do |(name, desc, tall, grande), idx|
  create_item(hot_bev, name, desc, tall, idx + 1) do |item|
    add_size_modifiers(item, tall, grande)
  end
end

puts "  Seeded #{hot_beverages.length} hot beverages"

# ============================================================================
# CATEGORY 5: Grab and Go
# ============================================================================
grab_go = havajava.menu_categories.find_or_create_by!(name: "Grab and Go") do |c|
  c.position = 5
  c.active = true
end

# Bagel
create_item(grab_go, "Bagel", "Fresh bagel with your choice of flavor and topping", 2.75, 1) do |item|
  flavor_group = item.modifier_groups.find_or_create_by!(name: "Bagel Flavor") do |mg|
    mg.required = true
    mg.min_select = 1
    mg.max_select = 1
    mg.position = 0
  end
  %w[Plain Everything Sesame Cinnamon\ Raisin Blueberry].each_with_index do |flavor, i|
    flavor_group.modifiers.find_or_create_by!(name: flavor) do |m|
      m.price_adjustment = 0
      m.default_selected = i == 0
      m.position = i
    end
  end

  topping_group = item.modifier_groups.find_or_create_by!(name: "Topping") do |mg|
    mg.required = false
    mg.min_select = 0
    mg.max_select = nil
    mg.position = 1
  end
  [
    ["Butter", 0.85],
    ["Jam", 0.85],
    ["Cream Cheese", 0.85],
  ].each_with_index do |(topping, price), i|
    topping_group.modifiers.find_or_create_by!(name: topping) do |m|
      m.price_adjustment = price
      m.default_selected = false
      m.position = i
    end
  end
end

# Snack Wraps
create_item(grab_go, "Ham & Swiss Snack Wrap", "Ham and Swiss cheese snack wrap", 4.75, 2)
create_item(grab_go, "Turkey & Swiss Snack Wrap", "Turkey and Swiss cheese snack wrap", 4.75, 3)

puts "  Seeded 3 grab and go items"

# ============================================================================
# CATEGORY 6: Breakfast Sandwiches
# ============================================================================
breakfast = havajava.menu_categories.find_or_create_by!(name: "Breakfast Sandwiches") do |c|
  c.position = 6
  c.active = true
end

create_item(breakfast, "Breakfast Sandwich", "Scrambled egg and cheese on English muffin with your choice of meat", 6.95, 1) do |item|
  meat_group = item.modifier_groups.find_or_create_by!(name: "Meat") do |mg|
    mg.required = true
    mg.min_select = 1
    mg.max_select = 1
    mg.position = 0
  end
  %w[Ham Bacon Sausage Turkey].each_with_index do |meat, i|
    meat_group.modifiers.find_or_create_by!(name: meat) do |m|
      m.price_adjustment = 0
      m.default_selected = i == 0
      m.position = i
    end
  end
end

puts "  Seeded 1 breakfast sandwich"

# ============================================================================
# CATEGORY 7: Custom Sandwiches
# ============================================================================
sandwiches = havajava.menu_categories.find_or_create_by!(name: "Custom Sandwiches") do |c|
  c.position = 7
  c.active = true
end

create_item(sandwiches, "Custom Sandwich", "Build your own sandwich — comes with choice of drink and cole slaw", 8.95, 1) do |item|
  # Meat (required, pick 1)
  meat_group = item.modifier_groups.find_or_create_by!(name: "Meat") do |mg|
    mg.required = true
    mg.min_select = 1
    mg.max_select = 1
    mg.position = 0
  end
  %w[Pastrami Turkey Ham Bacon Chicken\ Salad Tuna\ Salad].each_with_index do |meat, i|
    meat_group.modifiers.find_or_create_by!(name: meat) do |m|
      m.price_adjustment = 0
      m.default_selected = false
      m.position = i
    end
  end

  # Cheese (optional, pick 0-1, +$0.60)
  cheese_group = item.modifier_groups.find_or_create_by!(name: "Cheese") do |mg|
    mg.required = false
    mg.min_select = 0
    mg.max_select = 1
    mg.position = 1
  end
  %w[American Swiss Provolone].each_with_index do |cheese, i|
    cheese_group.modifiers.find_or_create_by!(name: cheese) do |m|
      m.price_adjustment = 0.60
      m.default_selected = false
      m.position = i
    end
  end

  # Veggies (optional, pick any)
  veggie_group = item.modifier_groups.find_or_create_by!(name: "Veggies") do |mg|
    mg.required = false
    mg.min_select = 0
    mg.max_select = nil
    mg.position = 2
  end
  %w[Lettuce Tomato Red\ Onion Alfalfa\ Sprouts Dill\ Pickles].each_with_index do |veggie, i|
    veggie_group.modifiers.find_or_create_by!(name: veggie) do |m|
      m.price_adjustment = 0
      m.default_selected = false
      m.position = i
    end
  end

  # Dressing (required, pick 1)
  dressing_group = item.modifier_groups.find_or_create_by!(name: "Dressing") do |mg|
    mg.required = true
    mg.min_select = 1
    mg.max_select = 1
    mg.position = 3
  end
  [
    "Regular Mayo", "Low-Fat Mayo", "Spicy Pika Mayo",
    "American Mustard", "Honey Mustard", "Dijon Mustard",
    "Hot English Mustard", "Olive Oil", "Red Wine Vinegar"
  ].each_with_index do |dressing, i|
    dressing_group.modifiers.find_or_create_by!(name: dressing) do |m|
      m.price_adjustment = 0
      m.default_selected = false
      m.position = i
    end
  end

  # Bread (required, pick 1)
  bread_group = item.modifier_groups.find_or_create_by!(name: "Bread") do |mg|
    mg.required = true
    mg.min_select = 1
    mg.max_select = 1
    mg.position = 4
  end
  ["White", "Whole Wheat", "French Baguette", "Italian Sub Roll", "Bagel"].each_with_index do |bread, i|
    bread_group.modifiers.find_or_create_by!(name: bread) do |m|
      m.price_adjustment = 0
      m.default_selected = false
      m.position = i
    end
  end

  # Toasted (optional)
  toasted_group = item.modifier_groups.find_or_create_by!(name: "Toasted?") do |mg|
    mg.required = false
    mg.min_select = 0
    mg.max_select = 1
    mg.position = 5
  end
  toasted_group.modifiers.find_or_create_by!(name: "Yes, toast it") do |m|
    m.price_adjustment = 0
    m.default_selected = false
    m.position = 0
  end
  toasted_group.modifiers.find_or_create_by!(name: "No thanks") do |m|
    m.price_adjustment = 0
    m.default_selected = true
    m.position = 1
  end

  # Included drink
  drink_group = item.modifier_groups.find_or_create_by!(name: "Included Drink") do |mg|
    mg.required = true
    mg.min_select = 1
    mg.max_select = 1
    mg.position = 6
  end
  ["Iced Coffee", "Iced Tea"].each_with_index do |drink, i|
    drink_group.modifiers.find_or_create_by!(name: drink) do |m|
      m.price_adjustment = 0
      m.default_selected = i == 0
      m.position = i
    end
  end

  # Order type
  dining_group = item.modifier_groups.find_or_create_by!(name: "Eat In / To Go") do |mg|
    mg.required = true
    mg.min_select = 1
    mg.max_select = 1
    mg.position = 7
  end
  ["Eat In", "To Go"].each_with_index do |option, i|
    dining_group.modifiers.find_or_create_by!(name: option) do |m|
      m.price_adjustment = 0
      m.default_selected = i == 0
      m.position = i
    end
  end
end

puts "  Seeded custom sandwich builder (8 modifier groups)"

# ============================================================================
# CATEGORY 8: Pastries
# ============================================================================
pastries = havajava.menu_categories.find_or_create_by!(name: "Pastries") do |c|
  c.position = 8
  c.active = true
end

pastry_items = [
  ["Brownies", "Rich chocolate brownies", 4.55],
  ["Carrot Cake", "Moist carrot cake with cream cheese frosting", 4.50],
  ["Almond Filled Croissant", "Flaky croissant filled with almond cream", 4.35],
  ["Blueberry Muffin", "Fresh blueberry muffin", 3.65],
  ["Double Chocolate Muffin", "Rich double chocolate muffin", 3.65],
  ["Blueberry Scone", "Buttery blueberry scone", 4.35],
  ["Banana Nut Muffin", "Banana nut muffin with walnuts", 3.65],
  ["Butter Croissant", "Classic buttery croissant", 3.95],
  ["Chocolate Croissant", "Croissant filled with chocolate", 4.25],
]

pastry_items.each_with_index do |(name, desc, price), idx|
  create_item(pastries, name, desc, price, idx + 1)
end

puts "  Seeded #{pastry_items.length} pastries"

# ============================================================================
# CATEGORY 9: Retail
# ============================================================================
retail = havajava.menu_categories.find_or_create_by!(name: "Retail") do |c|
  c.position = 9
  c.active = true
end

create_item(retail, "Lavazza Coffee Beans", "Premium Lavazza coffee beans — whole bean bag", 10.00, 1)
create_item(retail, "Gift Certificate", "HavaJava 671 gift certificate — great for any occasion", 25.00, 2) do |item|
  amount_group = item.modifier_groups.find_or_create_by!(name: "Amount") do |mg|
    mg.required = true
    mg.min_select = 1
    mg.max_select = 1
    mg.position = 0
  end
  [
    ["$10", -15.00],
    ["$25", 0],
    ["$50", 25.00],
    ["$100", 75.00],
  ].each_with_index do |(label, adj), i|
    amount_group.modifiers.find_or_create_by!(name: label) do |m|
      m.price_adjustment = adj
      m.default_selected = i == 1
      m.position = i
    end
  end
end

puts "  Seeded 2 retail items"

# ============================================================================
# SUMMARY
# ============================================================================
total_items = MenuItem.joins(menu_category: :restaurant).where(restaurants: { id: havajava.id }).count
total_modifier_groups = ModifierGroup.joins(menu_item: { menu_category: :restaurant }).where(restaurants: { id: havajava.id }).count
total_modifiers = Modifier.joins(modifier_group: { menu_item: { menu_category: :restaurant } }).where(restaurants: { id: havajava.id }).count

puts "\n✅ Seeding complete!"
puts "   Restaurant: #{havajava.name}"
puts "   Categories: #{havajava.menu_categories.count}"
puts "   Menu Items: #{total_items}"
puts "   Modifier Groups: #{total_modifier_groups}"
puts "   Modifiers: #{total_modifiers}"
