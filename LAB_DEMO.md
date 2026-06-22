# FOORGANICS E-Commerce MVP — Lab Demo Script

Follow this 5-minute demo flow for your lab paper presentation.

## Prerequisites

1. Supabase project configured (see README)
2. Admin user created in Supabase Auth
3. Schema and seed data applied
4. Frontend running: `npm start`

## Demo Flow

### Step 1: Admin Login
- Open http://localhost:3000/labadmin
- Sign in with your Supabase admin email and password

### Step 2: Add a Supplier
- Go to Suppliers → Add Supplier
- Example: Organic Farms Ltd, Ali Hassan, +92-300-1111111

### Step 3: Create Purchase Order
- Purchase Orders → New Purchase Order
- Select supplier, product, quantity 50, unit cost
- Click Mark Received — stock increases

### Step 4: Verify Inventory
- Inventory page shows updated stock

### Step 5: List Product on Store
- Product Listings → Edit → set price → List

### Step 6: Customer Purchase
- View Store → Add to cart → Checkout
- Delivery details → Demo Card payment → Place Order

### Step 7: Admin Orders
- Orders & Payments → View order → Confirm → Deliver

## Full Cycle

| Step | Action |
|------|--------|
| 1 | Add supplier |
| 2 | Create purchase order |
| 3 | Mark received (inventory +stock) |
| 4 | List product on store |
| 5 | Customer checkout + mock payment |
| 6 | Stock decremented automatically |
| 7 | Admin confirms delivery |
