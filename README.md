# FOORGANICS E-Commerce MERN Stack

University lab project — e-commerce management system with a customer store and admin panel, powered by **MongoDB + Express + React + Node.js (MERN)**.

## Project Structure

```
foorganics/
├── frontend/                 # React + TypeScript frontend (port 3000)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env                  # Frontend config
│   └── tsconfig.json
├── backend/                  # Express + MongoDB backend (port 5000)
│   ├── models/              # Mongoose schemas
│   ├── controllers/         # Business logic
│   ├── routes/              # API endpoints
│   ├── middleware/          # JWT auth, multer upload
│   ├── config/              # DB connection
│   ├── server.js
│   ├── .env                 # MongoDB & JWT config
│   └── package.json
└── README.md
```

## Features

**Customer Store** (`http://localhost:3000`)
- Browse listed products with product detail page
- Shopping cart (localStorage)
- Checkout with delivery info & payment (COD or Demo Card)
- Guest checkout (no login required)

**Admin Panel** (`http://localhost:3000/labadmin`)
- Dashboard with sales stats
- Supplier management (CRUD)
- Purchase orders (buy from suppliers → mark received → stock increases)
- Inventory view with low-stock alerts
- Product listings with image upload and publish toggle
- Orders & payments management

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB running locally or MongoDB Atlas connection string

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed          # Creates admin user + sample data
npm run dev          # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start            # Starts on http://localhost:3000
```

## Default Admin Login

- **Email:** `labadmin@foorganics.pk`
- **Password:** `Admin@123`

## API Endpoints

All API endpoints are prefixed with `http://localhost:5000/api`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | POST | Admin login (returns JWT) |
| `/products` | GET | Get all products (admin) |
| `/products/listed` | GET | Get listed products (public) |
| `/orders` | POST | Customer place order |
| `/orders` | GET | Get all orders (admin) |
| `/suppliers` | GET/POST/PUT/DELETE | Supplier CRUD (admin) |
| `/purchase-orders` | GET/POST | Purchase order operations (admin) |

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Tailwind CSS
- React Router v7
- Axios with JWT interceptor
- localStorage for JWT tokens

**Backend**
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- Multer for file uploads
- CORS enabled for localhost:3000

## Authentication

- JWT tokens stored in localStorage (`foorganics_token`)
- Protected routes require valid JWT in Authorization header
- Admin login returns JWT valid for 7 days

## Image Upload

- Images stored in `backend/uploads/`
- Served at `http://localhost:5000/uploads/<filename>`
- Multer validates image mime types (jpeg, png, webp, gif)

## Database Models

- **User** — Admin users with hashed passwords
- **Product** — Products with supplier reference
- **Supplier** — Supplier contact info
- **PurchaseOrder** — Orders from suppliers
- **Order** — Customer orders with order items

## Deployment Notes

For production deployment, update:
- `backend/.env` — MongoDB Atlas connection string, secure JWT secret
- `frontend/.env` — `REACT_APP_API_URL` pointing to production backend
- `backend/server.js` — `FRONTEND_URL` environment variable for CORS

## Lab Demo

See [LAB_DEMO.md](./LAB_DEMO.md) for step-by-step presentation script.
