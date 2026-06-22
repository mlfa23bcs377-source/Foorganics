import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFinanceDashboard } from '../services/financeService';
import type { FinanceDashboard } from '../types';

const rs = (n: number) => `Rs ${(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#16a34a', Utilities: '#0891b2', Internet: '#7c3aed',
  Marketing: '#dc2626', Transportation: '#d97706', Inventory: '#2563eb',
  'Employee Salary': '#059669', Maintenance: '#9333ea',
  'Office Supplies': '#6366f1', Other: '#6b7280',
};

function StatCard({ label, value, sub, color = 'organic', large = false }: {
  label: string; value: string; sub?: string; color?: string; large?: boolean;
}) {
  const bg = color === 'red' ? 'bg-red-50 border-red-200' :
    color === 'blue' ? 'bg-blue-50 border-blue-200' :
    color === 'amber' ? 'bg-amber-50 border-amber-200' :
    color === 'green' ? 'bg-green-50 border-green-200' :
    'bg-white border-stone-200';
  const txt = color === 'red' ? 'text-red-700' :
    color === 'blue' ? 'text-blue-700' :
    color === 'amber' ? 'text-amber-700' :
    color === 'green' ? 'text-green-700' :
    'text-organic-700';
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className={`font-bold ${large ? 'text-2xl' : 'text-xl'} ${txt}`}>{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({ data, colorKey = 'organic' }: { data: Array<{ label: string; value: number }>; colorKey?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const color = colorKey === 'red' ? '#dc2626' : colorKey === 'blue' ? '#2563eb' : '#16a34a';
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-stone-500 w-20 truncate text-right">{item.label}</span>
          <div className="flex-1 bg-earth-100 rounded h-5 overflow-hidden">
            <div
              className="h-5 rounded flex items-center justify-end pr-2 transition-all"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%`, backgroundColor: color }}
            >
              {item.value / max > 0.25 && (
                <span className="text-xs text-white font-medium">{rs(item.value)}</span>
              )}
            </div>
          </div>
          <span className="text-xs text-stone-600 w-24 text-right">{rs(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function CategoryDots({ data }: { data: Array<{ category: string; amount: number }> }) {
  const total = data.reduce((s, d) => s + d.amount, 0) || 1;
  const sorted = [...data].sort((a, b) => b.amount - a.amount);
  return (
    <div className="space-y-2.5">
      {sorted.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#6b7280' }} />
          <span className="text-sm text-stone-700 flex-1">{item.category}</span>
          <span className="text-sm font-semibold text-stone-800">{rs(item.amount)}</span>
          <span className="text-xs text-stone-400 w-10 text-right">{((item.amount / total) * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminFinanceDashboard() {
  const [data, setData] = useState<FinanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFinanceDashboard()
      .then(setData)
      .catch(e => setError(e?.response?.data?.message || 'Failed to load finance data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="text-center"><div className="w-8 h-8 border-4 border-organic-500 border-t-transparent rounded-full animate-spin mx-auto" /><p className="mt-3 text-stone-500">Loading financial data...</p></div>
    </div>
  );

  if (error) return (
    <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">{error}</div></div>
  );

  if (!data) return null;

  const { revenue, employees, inventory, expenses, profit } = data;
  const isProfit = profit.netProfit >= 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Finance Overview</h1>
          <p className="text-stone-500 text-sm mt-1">Real-time financial summary from all modules</p>
        </div>
        <div className="flex gap-3">
          <Link to="/labadmin/finance/expenses" className="px-4 py-2 bg-organic-600 hover:bg-organic-700 text-white text-sm font-medium rounded-lg">
            Manage Expenses
          </Link>
          <Link to="/labadmin/finance/salaries" className="px-4 py-2 border border-stone-300 hover:bg-earth-50 text-stone-700 text-sm font-medium rounded-lg">
            Salaries
          </Link>
        </div>
      </div>

      {/* Owner Earnings — Hero Card */}
      <div className={`rounded-2xl p-6 border-2 ${isProfit ? 'bg-organic-50 border-organic-300' : 'bg-red-50 border-red-300'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Owner Earnings (Net)</p>
            <p className={`text-4xl font-bold mt-1 ${isProfit ? 'text-organic-700' : 'text-red-700'}`}>
              {isProfit ? '+' : ''}{rs(profit.ownerEarnings)}
            </p>
            <p className={`text-sm mt-2 font-medium ${isProfit ? 'text-organic-600' : 'text-red-600'}`}>
              {isProfit ? '▲' : '▼'} {Math.abs(profit.profitMargin)}% profit margin
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center"><p className="text-stone-500">Revenue</p><p className="font-bold text-stone-800">{rs(profit.grossRevenue)}</p></div>
            <div className="text-center"><p className="text-stone-500">Salaries</p><p className="font-bold text-red-600">-{rs(profit.breakdown.salaries)}</p></div>
            <div className="text-center"><p className="text-stone-500">Inventory</p><p className="font-bold text-red-600">-{rs(profit.breakdown.inventoryCost)}</p></div>
            <div className="text-center"><p className="text-stone-500">Expenses</p><p className="font-bold text-red-600">-{rs(profit.breakdown.generalExpenses)}</p></div>
          </div>
        </div>
      </div>

      {/* Revenue Cards */}
      <section>
        <h2 className="text-base font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-organic-500 rounded-full inline-block" /> Revenue
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total Revenue" value={rs(revenue.total)} large />
          <StatCard label="Today" value={rs(revenue.today)} />
          <StatCard label="This Week" value={rs(revenue.weekly)} />
          <StatCard label="This Month" value={rs(revenue.monthly)} />
          <StatCard label="This Year" value={rs(revenue.annual)} />
        </div>
      </section>

      {/* Employees + Inventory side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-base font-semibold text-stone-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" /> Employee Financials
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Employees" value={String(employees.total)} sub={`${employees.active} active`} color="blue" />
            <StatCard label="Monthly Salary Budget" value={rs(employees.totalMonthlySalary)} color="blue" />
            <StatCard label="Total Salary Paid" value={rs(employees.totalPaid)} color="green" />
            <StatCard label="Salary Pending" value={rs(employees.totalPending)} color="amber" />
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-stone-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-amber-500 rounded-full inline-block" /> Inventory Value
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Current Stock (Cost)" value={rs(inventory.totalInvestment)} sub={`${inventory.totalProducts} products`} />
            <StatCard label="Total Purchased" value={rs(inventory.totalPurchaseCost)} />
            <StatCard label="Stock Selling Value" value={rs(inventory.totalStockValue)} color="green" />
            <StatCard label="Low Stock Value" value={rs(inventory.lowStockValue)} sub={`${inventory.lowStockCount} items`} color="amber" />
          </div>
        </section>
      </div>

      {/* Expense Cards */}
      <section>
        <h2 className="text-base font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-red-500 rounded-full inline-block" /> Expenses
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Expenses" value={rs(expenses.total)} color="red" large />
          <StatCard label="This Month" value={rs(expenses.monthly)} color="red" />
          <StatCard label="Operating" value={rs(expenses.operating)} color="red" />
          <StatCard label="Other" value={rs(expenses.other)} />
        </div>
      </section>

      {/* Profit Cards */}
      <section>
        <h2 className="text-base font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <span className={`w-1 h-4 rounded-full inline-block ${isProfit ? 'bg-organic-500' : 'bg-red-500'}`} /> Profit & Loss
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Gross Revenue" value={rs(profit.grossRevenue)} />
          <StatCard label="Total Deductions" value={rs(profit.totalDeductions)} color="red" />
          <StatCard label="Net Profit" value={rs(profit.netProfit)} color={isProfit ? 'green' : 'red'} large />
          <StatCard label="Profit Margin" value={`${profit.profitMargin}%`} color={isProfit ? 'green' : 'red'} />
          <StatCard label="Owner Earnings" value={rs(profit.ownerEarnings)} color={isProfit ? 'organic' : 'red'} />
        </div>
      </section>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Revenue Trend</h3>
            <Link to="/labadmin/finance/profit-loss" className="text-xs text-organic-600 hover:underline">Full Report →</Link>
          </div>
          {revenue.monthly_chart.length > 0 ? (
            <BarChart data={revenue.monthly_chart.map(m => ({ label: m.month, value: m.revenue }))} />
          ) : (
            <p className="text-stone-400 text-sm text-center py-8">No revenue data yet</p>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Expenses by Category</h3>
            <Link to="/labadmin/finance/expenses" className="text-xs text-organic-600 hover:underline">Manage →</Link>
          </div>
          {expenses.by_category.length > 0 ? (
            <CategoryDots data={expenses.by_category} />
          ) : (
            <p className="text-stone-400 text-sm text-center py-8">No expense records yet</p>
          )}
        </div>
      </div>

      {/* Owner Earnings Breakdown */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-5">Owner Earnings Breakdown</h3>
        <div className="max-w-lg mx-auto">
          <div className="space-y-3">
            {[
              { label: 'Total Revenue', value: profit.grossRevenue, type: 'income' },
              { label: 'Employee Salaries Paid', value: profit.breakdown.salaries, type: 'expense' },
              { label: 'Inventory Purchases', value: profit.breakdown.inventoryCost, type: 'expense' },
              { label: 'Operating Expenses', value: profit.breakdown.operatingExpenses, type: 'expense' },
              { label: 'Other Expenses', value: profit.breakdown.otherExpenses + (profit.breakdown.generalExpenses - profit.breakdown.operatingExpenses - profit.breakdown.otherExpenses), type: 'expense' },
            ].map((row, i) => (
              <div key={i} className={`flex items-center justify-between py-2.5 ${i < 4 ? 'border-b border-stone-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${row.type === 'income' ? 'text-organic-600' : 'text-red-500'}`}>
                    {row.type === 'income' ? '+' : '−'}
                  </span>
                  <span className="text-stone-700">{row.label}</span>
                </div>
                <span className={`font-semibold ${row.type === 'income' ? 'text-stone-800' : 'text-red-600'}`}>
                  {rs(row.value)}
                </span>
              </div>
            ))}
            <div className={`flex items-center justify-between pt-3 border-t-2 ${isProfit ? 'border-organic-400' : 'border-red-400'}`}>
              <span className="font-bold text-stone-800 text-lg">Final Amount (Owner Earnings)</span>
              <span className={`font-bold text-2xl ${isProfit ? 'text-organic-700' : 'text-red-700'}`}>{rs(profit.ownerEarnings)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4">
        {[
          { to: '/labadmin/finance/expenses', label: 'Manage Expenses', desc: 'Add & track expenses' },
          { to: '/labadmin/finance/salaries', label: 'Salary Records', desc: 'Track employee payments' },
          { to: '/labadmin/finance/profit-loss', label: 'Profit & Loss', desc: 'Monthly P&L report' },
          { to: '/labadmin/finance/reports', label: 'Reports & Export', desc: 'Download CSV reports' },
        ].map(link => (
          <Link key={link.to} to={link.to}
            className="bg-white rounded-xl border border-stone-200 hover:border-organic-300 hover:shadow-sm transition-all p-4"
          >
            <p className="font-medium text-stone-800 text-sm">{link.label}</p>
            <p className="text-xs text-stone-400 mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
