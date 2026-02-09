# Inventory System Design

**Version:** 1.0  
**Last Updated:** February 9, 2026  
**Status:** POC Implementation

---

## Overview

Inventory tracking for the ordering platform, supporting both simple item counts (10 brownies) and variant-level tracking (5 Blue/Large t-shirts).

---

## POC Implementation (Phase 2)

### Database Schema

```sql
-- Add to menu_items table
ALTER TABLE menu_items ADD COLUMN track_inventory BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN stock_quantity INTEGER;
ALTER TABLE menu_items ADD COLUMN low_stock_threshold INTEGER DEFAULT 5;

-- Add to merchandise_variants table
ALTER TABLE merchandise_variants ADD COLUMN track_inventory BOOLEAN DEFAULT true;
ALTER TABLE merchandise_variants ADD COLUMN stock_quantity INTEGER DEFAULT 0;
ALTER TABLE merchandise_variants ADD COLUMN low_stock_threshold INTEGER DEFAULT 5;

-- Stock audit log
CREATE TABLE stock_adjustments (
  id BIGSERIAL PRIMARY KEY,
  adjustable_type VARCHAR NOT NULL,  -- 'MenuItem' or 'MerchandiseVariant'
  adjustable_id BIGINT NOT NULL,
  location_id BIGINT,                -- NULL = all locations
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  adjustment INTEGER NOT NULL,       -- positive or negative
  reason VARCHAR NOT NULL,           -- 'order', 'refund', 'manual', 'import'
  reference_type VARCHAR,            -- 'Order', 'Refund', etc.
  reference_id BIGINT,               -- order_id, refund_id, etc.
  user_id BIGINT,                    -- who made the change (NULL for system)
  notes TEXT,
  created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_stock_adjustments_adjustable 
  ON stock_adjustments(adjustable_type, adjustable_id);
CREATE INDEX idx_stock_adjustments_created 
  ON stock_adjustments(created_at);
```

### Business Rules

| Rule | Behavior |
|------|----------|
| `track_inventory = false` | Unlimited stock, no tracking |
| `track_inventory = true, stock = 0` | Show "Sold Out", block ordering |
| `track_inventory = true, stock > 0` | Allow order, decrement on completion |
| `stock <= low_stock_threshold` | Flag for admin dashboard |
| Order placed | Decrement stock |
| Full refund | Restore stock automatically |
| Partial refund | Admin chooses whether to restore |
| Order cancelled | Restore stock |

### API Endpoints

```
# Admin endpoints
GET    /admin/inventory                    # List all tracked items
PATCH  /admin/inventory/:type/:id          # Update stock
POST   /admin/inventory/:type/:id/adjust   # Manual adjustment with reason
GET    /admin/inventory/low-stock          # Items below threshold
GET    /admin/inventory/audit-log          # Stock change history

# Public menu
GET    /restaurants/:slug/menu             # Includes availability status
```

### Menu Response Enhancement

```json
{
  "menu_items": [
    {
      "id": 1,
      "name": "Brownies",
      "price": 4.55,
      "available": true,
      "stock_status": "in_stock",      // "in_stock", "low_stock", "sold_out", null
      "stock_quantity": 8              // Only shown to admin
    }
  ]
}
```

### Order Flow

```
1. Customer adds item to cart
2. At checkout, verify stock still available
3. Create order (status: pending)
4. Decrement stock (with audit log)
5. If payment fails, restore stock
6. If order cancelled, restore stock
```

### Race Condition Handling

Use database-level locking:

```ruby
def decrement_stock!(quantity)
  with_lock do
    if stock_quantity >= quantity
      update!(stock_quantity: stock_quantity - quantity)
      log_adjustment(-quantity, 'order')
      true
    else
      false  # Out of stock
    end
  end
end
```

---

## V2 Features (Future)

### Stock Reservations
- Hold stock for 10 minutes during checkout
- Release if checkout abandoned
- Prevents overselling during high traffic

### Modifier-Level Inventory
- Track "Oat Milk" as having limited quantity
- Disable modifier when depleted

### POS Integration
- `external_sku` field for mapping
- Webhook to receive stock updates from Clover/Revel
- Scheduled sync jobs

### Batch Import/Export
- CSV upload for bulk stock updates
- Export current inventory
- `last_stock_sync_at` timestamp

### Advanced Alerts
- Email/SMS when stock is low
- Daily inventory report
- Predicted stockout based on sales velocity

### Composite Items
- "Combo Meal" decrements burger + fries + drink
- Recipe-based inventory (ingredients)

---

## Multi-Location Support

Stock is tracked per-location for Three Squares:

```ruby
# Get stock for specific location
item.stock_at(location_id)

# Global stock (sum of all locations)
item.total_stock

# Transfer between locations
InventoryService.transfer(item, from: loc1, to: loc2, quantity: 5)
```

For POC: Start with per-item stock, add location scoping when needed.

---

## Admin UI

### Inventory Dashboard
- Grid view of all tracked items
- Quick stock adjustment (+/- buttons)
- Low stock warnings highlighted
- Search and filter

### Audit Log View
- Chronological list of all changes
- Filter by item, user, reason
- Export to CSV

---

## Related Documents

- [REFUNDS_DESIGN.md](./REFUNDS_DESIGN.md) - Refund system (restores stock)
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall system design
- [BUILD_PLAN.md](../BUILD_PLAN.md) - Implementation timeline
