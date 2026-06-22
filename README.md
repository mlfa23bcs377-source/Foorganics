# FOORGANICS E-Commerce MVP

University lab project — a minimal e-commerce management system with a customer store and admin panel, powered by **Supabase** (PostgreSQL + Auth + Storage).

## Features

**Customer Store** (`/`)
- Browse listed products, product detail, cart (localStorage), checkout with mock payment (COD or Demo Card)

**Admin Panel** (`/labadmin`)
- Dashboard with stats
- Supplier management
- Purchase orders (buy from suppliers → mark received → stock increases)
- Inventory view with low-stock alerts
- Product listings with image upload and publish toggle
- Orders & payments management

## Setup

### 1. Supabase Project

1. Create a project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run in order:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
   - `supabase/storage.sql` (or create `product-images` bucket manually as public)
3. Create admin user: `npm run create:admin`

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Frontend

```bash
npm install
npm start
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/labadmin

### Admin Login (default)

- **Email:** `labadmin@foorganics.pk`
- **Password:** `Admin@123`

## Lab Demo

See [LAB_DEMO.md](./LAB_DEMO.md) for the step-by-step presentation script.

## Architecture

- **Frontend only** — React + TypeScript + Tailwind CSS
- **Supabase** — database, auth, storage, RPC functions for atomic order/inventory operations
- **No Express backend required** — `foorganics-backend/` is kept for reference only

## Business Cycle

```
Supplier → Purchase Order → Inventory → Store Listing → Cart → Checkout → Payment → Order Fulfillment
```
