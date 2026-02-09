# Refunds System Design

**Version:** 1.0  
**Last Updated:** February 9, 2026  
**Status:** POC Implementation

---

## Overview

Refund handling for the ordering platform, supporting full and partial refunds via Stripe with automatic inventory restoration.

---

## POC Implementation (Phase 2)

### Database Schema

```sql
CREATE TABLE refunds (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id),
  user_id BIGINT REFERENCES users(id),        -- Admin who processed
  
  -- Amounts
  amount DECIMAL(10,2) NOT NULL,              -- Refund amount
  refund_type VARCHAR NOT NULL,               -- 'full', 'partial'
  
  -- Stripe
  stripe_refund_id VARCHAR,                   -- Stripe refund ID (re_xxx)
  stripe_payment_intent_id VARCHAR,           -- Original payment intent
  
  -- Details
  reason VARCHAR NOT NULL,                    -- 'customer_request', 'item_unavailable', 'quality_issue', 'other'
  notes TEXT,                                 -- Admin notes
  
  -- Inventory
  restore_inventory BOOLEAN DEFAULT true,     -- Whether stock was restored
  
  -- Status
  status VARCHAR DEFAULT 'pending',           -- 'pending', 'completed', 'failed'
  error_message TEXT,                         -- If failed, why
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_refunds_order ON refunds(order_id);
CREATE INDEX idx_refunds_stripe ON refunds(stripe_refund_id);
CREATE INDEX idx_refunds_created ON refunds(created_at);

-- Track refund totals on orders
ALTER TABLE orders ADD COLUMN refunded_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN refund_status VARCHAR;  -- NULL, 'partial', 'full'
```

### Business Rules

| Scenario | Behavior |
|----------|----------|
| Full refund | Refund entire order total, mark order as refunded |
| Partial refund | Refund specified amount, track cumulative |
| Multiple partials | Allowed until total refunded = order total |
| Refund > remaining | Block, show error |
| Order not paid | Cannot refund (no payment to reverse) |
| Already fully refunded | Cannot refund again |
| Inventory restoration | Full = always restore, Partial = admin chooses |

### Refund Reasons (Enum)

```ruby
REFUND_REASONS = [
  'customer_request',    # Customer changed mind
  'item_unavailable',    # Out of stock after order
  'quality_issue',       # Food/product quality problem  
  'wrong_item',          # Incorrect item delivered
  'never_picked_up',     # Customer no-show
  'duplicate_charge',    # Technical issue
  'other'                # Free-form notes required
]
```

### API Endpoints

```
# Admin endpoints
POST   /admin/orders/:id/refund           # Process refund
GET    /admin/orders/:id/refunds          # Refund history for order
GET    /admin/refunds                     # All refunds (paginated)
GET    /admin/refunds/summary             # Refund totals for reporting
```

### Refund Request Payload

```json
{
  "refund": {
    "amount": 5.00,                    // Required for partial
    "refund_type": "partial",          // "full" or "partial"
    "reason": "quality_issue",
    "notes": "Customer reported cold coffee",
    "restore_inventory": true          // For partial refunds
  }
}
```

### Refund Response

```json
{
  "refund": {
    "id": 1,
    "order_id": 42,
    "amount": 5.00,
    "refund_type": "partial",
    "reason": "quality_issue",
    "status": "completed",
    "stripe_refund_id": "re_xxx",
    "created_at": "2026-02-09T06:30:00Z"
  },
  "order": {
    "id": 42,
    "total": 15.00,
    "refunded_amount": 5.00,
    "refund_status": "partial",
    "net_amount": 10.00
  }
}
```

### RefundService

```ruby
class RefundService
  def initialize(order, admin_user)
    @order = order
    @admin = admin_user
  end

  def full_refund!(reason:, notes: nil)
    process_refund(
      amount: @order.total - @order.refunded_amount,
      refund_type: 'full',
      reason: reason,
      notes: notes,
      restore_inventory: true
    )
  end

  def partial_refund!(amount:, reason:, notes: nil, restore_inventory: false)
    validate_partial_amount!(amount)
    process_refund(
      amount: amount,
      refund_type: 'partial',
      reason: reason,
      notes: notes,
      restore_inventory: restore_inventory
    )
  end

  private

  def process_refund(params)
    Refund.transaction do
      # 1. Create Stripe refund
      stripe_refund = Stripe::Refund.create(
        payment_intent: @order.stripe_payment_intent_id,
        amount: (params[:amount] * 100).to_i,
        reason: map_reason(params[:reason])
      )

      # 2. Create refund record
      refund = @order.refunds.create!(
        user: @admin,
        stripe_refund_id: stripe_refund.id,
        stripe_payment_intent_id: @order.stripe_payment_intent_id,
        status: 'completed',
        **params
      )

      # 3. Update order totals
      @order.update!(
        refunded_amount: @order.refunded_amount + params[:amount],
        refund_status: calculate_refund_status
      )

      # 4. Restore inventory if requested
      if params[:restore_inventory]
        InventoryService.restore_for_order(@order)
      end

      # 5. Log audit
      AuditLog.record('refund', refund, @admin)

      refund
    end
  rescue Stripe::StripeError => e
    Refund.create!(
      order: @order,
      user: @admin,
      status: 'failed',
      error_message: e.message,
      **params
    )
    raise RefundError, e.message
  end
end
```

---

## V2 Features (Future)

### Item-Level Refunds
- Refund specific items, not just amounts
- "Refund the $5 coffee but keep the $4 muffin"
- Auto-calculate amount from items
- Better inventory restoration (only restore refunded items)

### Store Credit
- Option to refund to store credit instead of card
- Credit balance on customer account
- Apply credit at checkout

### Refund Approval Workflow
- Manager approval for refunds over $X
- Audit trail of approvals

### Automated Refunds
- API endpoint for customers to request refunds
- Auto-approve based on rules (within 1 hour, etc.)
- Fraud detection

### Chargeback Handling
- Webhook for Stripe disputes
- Link chargebacks to orders
- Track dispute outcomes

### Reporting
- Refund rate by item (quality issues?)
- Refund rate by staff member
- Daily/weekly refund totals
- Refund reasons breakdown

---

## Admin UI

### Order Detail - Refund Section
```
┌─────────────────────────────────────────┐
│ Order #42                    Total: $15 │
│ Status: Completed                       │
├─────────────────────────────────────────┤
│ Refunds                                 │
│ ├─ $5.00 (partial) - Quality issue     │
│ │   Feb 9, 2026 by admin@...           │
│ └─ Remaining: $10.00                   │
├─────────────────────────────────────────┤
│ [Full Refund $10] [Partial Refund]     │
└─────────────────────────────────────────┘
```

### Refund Modal
```
┌─────────────────────────────────────────┐
│ Process Refund                          │
├─────────────────────────────────────────┤
│ Type:   ○ Full ($10.00)  ● Partial     │
│ Amount: [$ 5.00        ]               │
│                                         │
│ Reason: [Quality Issue      ▼]         │
│ Notes:  [Customer complained...]       │
│                                         │
│ ☑ Restore inventory                    │
├─────────────────────────────────────────┤
│           [Cancel] [Process Refund]    │
└─────────────────────────────────────────┘
```

---

## Related Documents

- [INVENTORY_DESIGN.md](./INVENTORY_DESIGN.md) - Inventory system (restored on refund)
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall system design
- [BUILD_PLAN.md](../BUILD_PLAN.md) - Implementation timeline
