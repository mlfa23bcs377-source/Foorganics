import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  HomeIcon,
  TruckIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import { useAdminAuth } from '../../context/AdminAuthContext';

const navItems = [
  { to: '/labadmin/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/labadmin/suppliers', label: 'Suppliers', icon: TruckIcon },
  { to: '/labadmin/purchases', label: 'Purchase Orders', icon: ShoppingCartIcon },
  { to: '/labadmin/inventory', label: 'Inventory', icon: ArchiveBoxIcon },
  { to: '/labadmin/products', label: 'Product Listings', icon: TagIcon },
  { to: '/labadmin/orders', label: 'Orders & Payments', icon: ClipboardDocumentListIcon },
  { to: '/labadmin/employees', label: 'Employees', icon: UserGroupIcon },
  { to: '/labadmin/attendance', label: 'Attendance', icon: CalendarDaysIcon },
];

const financeItems = [
  { to: '/labadmin/finance', label: 'Finance Overview', icon: BanknotesIcon },
  { to: '/labadmin/finance/expenses', label: 'Expenses', icon: ReceiptPercentIcon },
  { to: '/labadmin/finance/salaries', label: 'Salaries', icon: UserGroupIcon },
  { to: '/labadmin/finance/profit-loss', label: 'Profit & Loss', icon: ChartBarIcon },
  { to: '/labadmin/finance/reports', label: 'Reports', icon: DocumentTextIcon },
];

const AdminLayout: React.FC = () => {
  const { signOut } = useAdminAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/labadmin';
  };

  return (
    <div className="min-h-screen bg-earth-50 flex">
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b border-earth-200">
          <Link to="/labadmin/dashboard" className="text-xl font-bold text-organic-700">
            FOORGANICS
          </Link>
          <p className="text-xs text-earth-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-organic-100 text-organic-700'
                    : 'text-earth-600 hover:bg-earth-100 hover:text-earth-900'
                }`
              }
            >
              <Icon className="h-5 w-5 mr-3" />
              {label}
            </NavLink>
          ))}
          <div className="pt-3 mt-3 border-t border-earth-100">
            <p className="px-3 py-1 text-xs font-semibold text-earth-400 uppercase tracking-wide">Finance</p>
            {financeItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/labadmin/finance'}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-organic-100 text-organic-700'
                      : 'text-earth-600 hover:bg-earth-100 hover:text-earth-900'
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="p-4 border-t border-earth-200 space-y-2">
          <Link
            to="/"
            className="flex items-center px-3 py-2 text-sm text-earth-600 hover:text-organic-600"
          >
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
