# FOORGANICS Frontend Documentation

## 📋 Overview
The FOORGANICS frontend is a React TypeScript e-commerce application built with Tailwind CSS, featuring a clean organic food store with shopping cart functionality and admin dashboard.

---

## 🗂️ Project Structure

```
foorganics-frontend/src/
├── components/              # Reusable UI components
│   ├── common/              # Shared components
│   │   ├── Button.tsx       # Custom button component
│   │   ├── Card.tsx         # Card wrapper component
│   │   ├── Input.tsx        # Form input component
│   │   └── Badge.tsx        # Badge component
│   ├── layout/              # Layout components
│   │   ├── Header.tsx       # Navigation header
│   │   └── Footer.tsx       # Page footer
│   ├── product/             # Product-specific components
│   │   └── ProductCard.tsx  # Product display card
│   └── index.ts             # Component exports
├── pages/                   # Page components
│   ├── customer/            # Customer-facing pages
│   │   ├── HomePage.tsx     # Landing page
│   │   ├── ProductsPage.tsx # Product catalog
│   │   ├── ProductDetailPage.tsx # Single product view
│   │   ├── CartPage.tsx     # Shopping cart
│   │   └── CheckoutPage.tsx # Checkout process
│   └── admin/               # Admin pages
│       ├── AdminLoginPage.tsx # Admin authentication
│       └── AdminDashboardPage.tsx # Admin dashboard
├── context/                 # React Context
│   └── CartContext.tsx     # Shopping cart state management
├── services/                # API services
│   └── api.ts              # Axios API configuration
├── types/                   # TypeScript type definitions
│   └── index.ts            # Shared interfaces
├── styles/                  # Global styles
│   └── index.css           # Tailwind CSS imports
├── App.tsx                  # Main application component
├── index.tsx               # Application entry point
└── index.css              # Base CSS styles
```

---

## 🧩 Component Details

### 📦 Common Components

#### Button.tsx
**Purpose**: Reusable button component with variants and sizes
**Props**:
- `variant`: 'primary' | 'secondary' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `onClick`: Click handler function
- `disabled`: Disable state
- `children`: Button content

#### Card.tsx
**Purpose**: Wrapper component for card layouts
**Props**:
- `children`: Card content
- `className`: Additional CSS classes
- `hover`: Enable hover effects

#### Input.tsx
**Purpose**: Form input component with label support
**Props**:
- `type`: Input type (text, email, password, etc.)
- `value`: Input value
- `onChange`: Change handler
- `label`: Input label
- `required`: Required field indicator

#### Badge.tsx
**Purpose**: Badge component for status indicators
**Props**:
- `children`: Badge content
- `variant': 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
- `className`: Additional CSS classes

---

### 🎨 Layout Components

#### Header.tsx
**Purpose**: Main navigation header with cart and admin links
**Features**:
- FOORGANICS branding
- Navigation menu (Home, Products, About, Contact)
- Shopping cart with item counter
- Admin login link
- Sticky positioning
- Responsive design

#### Footer.tsx
**Purpose**: Page footer with company information
**Features**:
- Company description
- Contact information
- Social media links
- Copyright notice

---

### 🛍️ Product Components

#### ProductCard.tsx
**Purpose**: Display individual product information
**Props**:
- `product`: Product object with id, name, price, description, image, category
**Features**:
- Product image with placeholder
- Product name and category badge
- Description with line clamp
- Price display in PKR
- Add to cart functionality
- Hover effects

---

## 📄 Page Components

### Customer Pages

#### HomePage.tsx
**Purpose**: Landing page with hero section and featured products
**Sections**:
- Hero section with call-to-action
- Features section (100% Organic, Healthy Living, Fast Delivery)
- Featured products grid (first 4 products)
- Loading states

#### ProductsPage.tsx
**Purpose**: Product catalog with search and filtering
**Features**:
- Product grid display
- Category filter dropdown
- Search functionality
- Loading states
- Empty state handling

#### ProductDetailPage.tsx
**Purpose**: Detailed single product view
**Features**:
- Product image gallery
- Product information display
- Quantity selector
- Add to cart functionality
- Product benefits list
- Back to products navigation

#### CartPage.tsx
**Purpose**: Shopping cart management
**Features**:
- Cart items list with quantity controls
- Item removal functionality
- Order summary with subtotal, tax, and total
- Clear cart option
- Checkout navigation
- Empty cart state

#### CheckoutPage.tsx
**Purpose**: Order checkout process
**Features**:
- Customer information form
- Delivery address form
- Payment method selection
- Order summary
- Place order functionality
- Form validation

### Admin Pages

#### AdminLoginPage.tsx
**Purpose**: Admin authentication
**Features**:
- Login form with username/password
- Token-based authentication
- Error handling
- Loading states
- Redirect to dashboard on success

#### AdminDashboardPage.tsx
**Purpose**: Admin management interface
**Features**:
- Dashboard statistics (products, orders, status counts)
- Recent orders list
- Order management (view, update status)
- Product management links
- Authentication check

---

## 🔄 State Management

### CartContext.tsx
**Purpose**: Global shopping cart state management
**State**:
- `items`: Array of cart items
- `total`: Cart total price

**Actions**:
- `addToCart`: Add product to cart
- `removeFromCart`: Remove item from cart
- `updateQuantity`: Update item quantity
- `clearCart`: Clear all items

---

## 🌐 API Services

### api.ts
**Purpose**: Axios-based API client configuration
**Base URL**: `http://localhost:5000/api`

**Endpoints**:
- `productApi`: Product CRUD operations
- `orderApi`: Order management
- `adminApi`: Admin authentication and statistics

**Response Format**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

---

## 🎨 Styling

### Tailwind CSS Configuration
**File**: `tailwind.config.js`
**Custom Colors**:
- `organic-*`: Green palette for organic theme
- `earth-*`: Brown/natural palette

### CSS Classes
**Button Classes**:
- `btn-primary`: Primary action buttons (organic green)
- `btn-secondary`: Secondary buttons (earth brown)

**Card Classes**:
- `card`: Base card styling with shadows and hover effects

---

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up

### Responsive Features
- Mobile-first design approach
- Collapsible navigation menu
- Responsive product grids
- Touch-friendly buttons and inputs

---

## 🔧 Configuration Files

### package.json
**Key Dependencies**:
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Heroicons

### TypeScript Configuration
**File**: `tsconfig.json`
**Features**:
- Strict type checking
- Path mapping for imports
- JSX support

---

## 🚀 Development

### Available Scripts
- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

### Development Server
**URL**: http://localhost:3000
**Features**:
- Hot module replacement
- Error overlay
- Source maps

---

## 🎯 Key Features

### E-commerce Functionality
- Product browsing and filtering
- Shopping cart management
- Guest checkout
- Order placement
- Admin dashboard

### User Experience
- Clean, modern design
- Organic food theme
- Responsive layout
- Loading states
- Error handling
- Accessibility considerations

### Technical Features
- TypeScript for type safety
- Component-based architecture
- Context API for state management
- RESTful API integration
- Tailwind CSS for styling

---

## 📝 Notes

### Currency
- All prices displayed in Pakistani Rupees (PKR)
- Symbol: ₨
- Formatting: `toLocaleString()` for proper number formatting

### Images
- Product images stored in `/public/images/`
- Placeholder images: `/api/placeholder/{width}/{height}`
- Fallback handling for missing images

### Authentication
- Admin login uses JWT tokens
- Tokens stored in localStorage
- Protected routes check authentication

---

## 🔮 Future Enhancements

### Planned Features
- User accounts and profiles
- Order history
- Product reviews and ratings
- Wishlist functionality
- Payment gateway integration
- Product search with filters
- Inventory management

### Technical Improvements
- Unit testing with Jest
- E2E testing with Cypress
- Performance optimization
- PWA implementation
- Internationalization support
