import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const Header: React.FC = () => {
  const { state } = useCart();
  const { session, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setAccountMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-organic-700">FOORGANICS</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-earth-700 hover:text-organic-600 transition-colors font-medium">Home</Link>
            <Link to="/products" className="text-earth-700 hover:text-organic-600 transition-colors font-medium">Products</Link>
            <Link to="/track" className="text-earth-700 hover:text-organic-600 transition-colors font-medium">Track Order</Link>
            <Link to="/about" className="text-earth-700 hover:text-organic-600 transition-colors font-medium">About</Link>
            <Link to="/contact" className="text-earth-700 hover:text-organic-600 transition-colors font-medium">Contact</Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Customer Account */}
            {session ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-1.5 text-earth-700 hover:text-organic-600 transition-colors p-2"
                >
                  <div className="w-7 h-7 rounded-full bg-organic-100 flex items-center justify-center text-sm font-semibold text-organic-700">
                    {session.customer.fullName[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                    {session.customer.fullName.split(' ')[0]}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 hidden sm:block" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-stone-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-400">Signed in as</p>
                      <p className="text-sm font-medium text-stone-800 truncate">{session.customer.email}</p>
                    </div>
                    <Link to="/account" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50">
                      Dashboard
                    </Link>
                    <Link to="/account/orders" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50">
                      My Orders
                    </Link>
                    <Link to="/track" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50">
                      Track Order
                    </Link>
                    <Link to="/account/profile" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50">
                      Profile & Addresses
                    </Link>
                    <div className="border-t border-stone-100 mt-1">
                      <Link to="/labadmin" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-stone-400 hover:bg-stone-50">
                        Admin Panel
                      </Link>
                      <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-earth-700 hover:text-organic-600 transition-colors p-2">
                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="hidden sm:block text-sm font-medium">Sign In</span>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative text-earth-700 hover:text-organic-600 transition-colors p-2">
              <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-organic-600 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-earth-700 hover:text-organic-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-earth-100">
            <div className="flex flex-col space-y-1">
              {[['/', 'Home'], ['/products', 'Products'], ['/track', 'Track Order'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
                <Link key={to} to={to} className="text-earth-700 hover:text-organic-600 font-medium py-2 px-3 rounded-lg hover:bg-earth-50"
                  onClick={() => setMobileMenuOpen(false)}>
                  {label}
                </Link>
              ))}
              <div className="border-t border-earth-100 pt-2 mt-1">
                {session ? (
                  <>
                    <Link to="/account" className="text-earth-700 hover:text-organic-600 font-medium py-2 px-3 rounded-lg hover:bg-earth-50 block" onClick={() => setMobileMenuOpen(false)}>
                      My Account ({session.customer.fullName.split(' ')[0]})
                    </Link>
                    <Link to="/account/orders" className="text-earth-700 hover:text-organic-600 py-2 px-3 rounded-lg hover:bg-earth-50 block text-sm" onClick={() => setMobileMenuOpen(false)}>
                      My Orders
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left text-red-600 py-2 px-3 rounded-lg hover:bg-red-50 text-sm">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="text-earth-700 hover:text-organic-600 font-medium py-2 px-3 rounded-lg hover:bg-earth-50 block" onClick={() => setMobileMenuOpen(false)}>
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
