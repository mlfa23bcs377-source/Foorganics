import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSuppliersPage from './pages/AdminSuppliersPage';
import AdminPurchasesPage from './pages/AdminPurchasesPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import AdminEmployeeDetailPage from './pages/AdminEmployeeDetailPage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import AdminFinanceDashboard from './pages/AdminFinanceDashboard';
import AdminExpensesPage from './pages/AdminExpensesPage';
import AdminSalariesPage from './pages/AdminSalariesPage';
import AdminProfitLossPage from './pages/AdminProfitLossPage';
import AdminReportsPage from './pages/AdminReportsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/labadmin');
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isCustomerAccountPage = location.pathname.startsWith('/account') || location.pathname.startsWith('/track');
  const hideHeaderFooter = isAdminRoute || isAuthPage || isCustomerAccountPage;

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderFooter && <Header />}
      <main className="flex-grow">
        <Routes>
          {/* ── Public Store Routes ─────────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* ── Customer Auth Routes ────────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ── Customer Dashboard Routes ────────────────────────────────── */}
          <Route path="/account" element={<CustomerDashboardPage />} />
          <Route path="/account/orders" element={<OrderHistoryPage />} />
          <Route path="/account/orders/:id" element={<OrderDetailPage />} />
          <Route path="/account/profile" element={<CustomerProfilePage />} />

          {/* ── Public Order Tracking ────────────────────────────────────── */}
          <Route path="/track" element={<OrderTrackingPage />} />

          {/* ── Admin Routes ─────────────────────────────────────────────── */}
          <Route path="/labadmin">
            <Route index element={<AdminLoginPage />} />
            <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="suppliers" element={<AdminSuppliersPage />} />
              <Route path="purchases" element={<AdminPurchasesPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="employees" element={<AdminEmployeesPage />} />
              <Route path="employees/:id" element={<AdminEmployeeDetailPage />} />
              <Route path="attendance" element={<AdminAttendancePage />} />
              <Route path="finance" element={<AdminFinanceDashboard />} />
              <Route path="finance/expenses" element={<AdminExpensesPage />} />
              <Route path="finance/salaries" element={<AdminSalariesPage />} />
              <Route path="finance/profit-loss" element={<AdminProfitLossPage />} />
              <Route path="finance/reports" element={<AdminReportsPage />} />
            </Route>
          </Route>
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <ToastProvider>
          <AdminAuthProvider>
            <CustomerAuthProvider>
              <AppContent />
            </CustomerAuthProvider>
          </AdminAuthProvider>
        </ToastProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
