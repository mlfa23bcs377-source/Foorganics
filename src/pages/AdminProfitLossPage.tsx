import React, { useEffect, useState } from 'react';
import { getProfit } from '../services/financeService';

const rs = (n: number) => `Rs ${(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthlyPL {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
}

function GroupedBars({ data }: { data: MonthlyPL[] }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.expenses)), 1);
  return (
    <div className="space-y-3">
      {data.filter(d => d.revenue > 0 || d.expenses > 0).map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-stone-500 w-10 text-right">{row.month}</span>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1">
              <div className="bg-organic-500 h-4 rounded" style={{ width: `${Math.max(2, (row.revenue / maxVal) * 100)}%` }} />
              <span className="text-xs text-stone-500">{rs(row.revenue)}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="bg-red-400 h-4 rounded" style={{ width: `${Math.max(2, (row.expenses / maxVal) * 100)}%` }} />
              <span className="text-xs text-stone-500">{rs(row.expenses)}</span>
            </div>
          </div>
          <div className="w-24 text-right">
            <span className={`text-xs font-bold ${row.profit >= 0 ? 'text-organic-700' : 'text-red-600'}`}>
              {row.profit >= 0 ? '+' : ''}{rs(row.profit)}
            </span>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-organic-500 rounded" /><span className="text-xs text-stone-500">Revenue</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-400 rounded" /><span className="text-xs text-stone-500">Expenses</span></div>
      </div>
    </div>
  );
}

export default function AdminProfitLossPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthly, setMonthly] = useState<MonthlyPL[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProfit({ year: String(year) })
      .then(d => setMonthly(d.monthly || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year]);

  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
  const totalProfit = monthly.reduce((s, m) => s + m.profit, 0);
  const isProfit = totalProfit >= 0;
  const profitableMonths = monthly.filter(m => m.profit > 0).length;
  const activeMonths = monthly.filter(m => m.revenue > 0 || m.expenses > 0).length;

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Profit & Loss</h1>
          <p className="text-stone-500 text-sm mt-1">Monthly revenue vs expense breakdown</p>
        </div>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-700"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Annual Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-xs text-stone-500 mb-1">Annual Revenue</p>
          <p className="text-xl font-bold text-stone-800">{rs(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-xs text-stone-500 mb-1">Annual Expenses</p>
          <p className="text-xl font-bold text-red-600">{rs(totalExpenses)}</p>
        </div>
        <div className={`rounded-xl border-2 p-4 ${isProfit ? 'bg-organic-50 border-organic-300' : 'bg-red-50 border-red-300'}`}>
          <p className="text-xs text-stone-500 mb-1">Net Profit</p>
          <p className={`text-xl font-bold ${isProfit ? 'text-organic-700' : 'text-red-700'}`}>{isProfit ? '+' : ''}{rs(totalProfit)}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-xs text-stone-500 mb-1">Profitable Months</p>
          <p className="text-xl font-bold text-stone-800">{profitableMonths} / {activeMonths}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-5">Monthly Revenue vs Expenses ({year})</h3>
        {loading ? (
          <div className="text-center py-10 text-stone-400">Loading...</div>
        ) : activeMonths === 0 ? (
          <div className="text-center py-10 text-stone-400">No data for {year}</div>
        ) : (
          <GroupedBars data={monthly} />
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800">Monthly Breakdown {year}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-earth-50 border-b border-stone-200">
              <tr>
                {['Month', 'Revenue', 'Expenses', 'Net Profit', 'Margin', 'Orders'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {monthly.map((row, i) => {
                const margin = row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : '0';
                const isPos = row.profit >= 0;
                return (
                  <tr key={i} className={`hover:bg-earth-50 transition-colors ${row.revenue === 0 && row.expenses === 0 ? 'opacity-40' : ''}`}>
                    <td className="px-4 py-3 font-medium text-stone-700">{MONTH_NAMES[i]} {year}</td>
                    <td className="px-4 py-3 text-stone-800">{row.revenue > 0 ? rs(row.revenue) : '—'}</td>
                    <td className="px-4 py-3 text-red-600">{row.expenses > 0 ? rs(row.expenses) : '—'}</td>
                    <td className={`px-4 py-3 font-semibold ${row.revenue > 0 || row.expenses > 0 ? (isPos ? 'text-organic-700' : 'text-red-600') : 'text-stone-400'}`}>
                      {(row.revenue > 0 || row.expenses > 0) ? `${isPos ? '+' : ''}${rs(row.profit)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-500">{row.revenue > 0 ? `${margin}%` : '—'}</td>
                    <td className="px-4 py-3 text-stone-500">{row.orders > 0 ? row.orders : '—'}</td>
                  </tr>
                );
              })}
              <tr className="bg-earth-50 font-semibold border-t-2 border-stone-300">
                <td className="px-4 py-3 text-stone-800">Total {year}</td>
                <td className="px-4 py-3 text-stone-800">{rs(totalRevenue)}</td>
                <td className="px-4 py-3 text-red-600">{rs(totalExpenses)}</td>
                <td className={`px-4 py-3 font-bold text-lg ${isProfit ? 'text-organic-700' : 'text-red-700'}`}>
                  {isProfit ? '+' : ''}{rs(totalProfit)}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}%` : '—'}
                </td>
                <td className="px-4 py-3 text-stone-600">{monthly.reduce((s, m) => s + m.orders, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
