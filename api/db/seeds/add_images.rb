# Add product images to menu items and merchandise
# Uses Unsplash for high-quality placeholder images

puts "Adding product images..."

# Unsplash image IDs by category
COFFEE_IMAGES = [
  "photo-1509042239860-f550ce710b93", # Latte art
  "photo-1461023058943-07fcbe16d735", # Coffee cup
  "photo-1495474472287-4d71bcdd2085", # Coffee on table
  "photo-1497636577773-f1231844b336", # Cappuccino
  "photo-1514432324607-a09d9b4aefdd", # Mocha
  "photo-1572442388796-11668a67e53d", # Iced coffee
  "photo-1517701550927-30cf4ba1dba5", # Coffee beans
]

FRAPPE_IMAGES = [
  "photo-1461023058943-07fcbe16d735", # Frozen drink
  "photo-1572490122747-3968b75cc699", # Iced frappe
  "photo-1553909489-cd47e0907980", # Blended coffee
  "photo-1592663527359-cf6642f54cff", # Iced mocha
]

SMOOTHIE_IMAGES = [
  "photo-1505252585461-04db1eb84625", # Fruit smoothie
  "photo-1638176066666-ffb2f013c7dd", # Berry smoothie
  "photo-1610970881699-44a5587cabec", # Green smoothie
]

TEA_IMAGES = [
  "photo-1556679343-c7306c1976bc", # Hot tea
  "photo-1564890369478-c89ca6d9cde9", # Tea cup
  "photo-1597318181409-cf64d0b5d8a2", # Chai
]

FOOD_IMAGES = [
  "photo-1585671299756-4e9a1c0b0a9c", # Bagel
  "photo-1528735602780-2552fd46c7af", # Sandwich
  "photo-1481070555726-e2fe8357571d", # Wrap
  "photo-1619096252214-ef06c45683e3", # Pastry
]

COOKIE_IMAGES = [
  "photo-1499636136210-6f4ee915583e", # Cookies
  "photo-1558961363-fa8fdf82db35", # Assorted cookies
  "photo-1590080875515-8a3a8dc5735e", # Cookie box
  "photo-1548365328-8c6db3220e4c", # Shortbread
]

def unsplash_url(photo_id)
  "https://images.unsplash.com/#{photo_id}?w=400&h=300&fit=crop&auto=format"
end

# Helper to pick image based on item name
def image_for_item(name, category_name)
  name_lower = name.downcase
  category_lower = category_name.downcase

  if name_lower.include?("frapp") || name_lower.include?("frozen") || name_lower.include?("slush")
    unsplash_url(FRAPPE_IMAGES.sample)
  elsif name_lower.include?("smoothie") || name_lower.include?("fruit")
    unsplash_url(SMOOTHIE_IMAGES.sample)
  elsif name_lower.include?("tea") || name_lower.include?("chai")
    unsplash_url(TEA_IMAGES.sample)
  elsif name_lower.include?("bagel") || name_lower.include?("wrap") || name_lower.include?("sandwich") || category_lower.include?("food")
    unsplash_url(FOOD_IMAGES.sample)
  elsif name_lower.include?("cookie") || name_lower.include?("shortbread") || name_lower.include?("assortment")
    unsplash_url(COOKIE_IMAGES.sample)
  else
    # Default to coffee for coffee shops
    unsplash_url(COFFEE_IMAGES.sample)
  end
end

# Update HavaJava menu items
havajava = Restaurant.find_by(slug: "havajava")
if havajava
  havajava.menu_categories.each do |category|
    category.menu_items.each do |item|
      next if item.image_url.present?
      
      item.update!(image_url: image_for_item(item.name, category.name))
      puts "  #{item.name} => image added"
    end
  end
  puts "✓ HavaJava images updated"
end

# Update Three Squares menu items
threesquares = Restaurant.find_by(slug: "threesquares")
if threesquares
  threesquares.menu_categories.each do |category|
    category.menu_items.each do |item|
      next if item.image_url.present?
      
      item.update!(image_url: image_for_item(item.name, category.name))
      puts "  #{item.name} => image added"
    end
  end
  puts "✓ Three Squares images updated"

  # Update merchandise (cookies)
  threesquares.merchandise_categories.each do |category|
    category.merchandise_items.each do |item|
      next if item.image_url.present?
      
      item.update!(image_url: unsplash_url(COOKIE_IMAGES.sample))
      puts "  [Merch] #{item.name} => image added"
    end
  end
  puts "✓ Three Squares merchandise images updated"
end

puts "\nDone! All product images added."
