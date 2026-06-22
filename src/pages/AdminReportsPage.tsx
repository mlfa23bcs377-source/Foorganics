import React, { useState } from 'react';
import { getFinanceReports } from '../services/financeService';

const rs = (n: number) => `Rs ${(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

type ReportType = 'profit_loss' | 'revenue' | 'expense' | 'salary';

const REPORT_TYPES: { value: ReportType; label: string; desc: string }[] = [
  { value: 'profit_loss', label: 'Profit & Loss', desc: 'Revenue vs expenses summary' },
  { value: 'revenue', label: 'Revenue Report', desc: 'Order-by-order sales data' },
  { value: 'expense', label: 'Expense Report', desc: 'All expense records with categories' },
  { value: 'salary', label: 'Salary Report', desc: 'Employee salary payments' },
];

function exportToCSV(rows: string[][], filename: string) {
  const content = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('profit_loss');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true); setError(''); setReport(null);
    try {
      const params: Record<string, string> = { type: reportType };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (month) params.month = month;
      const data = await getFinanceReports(params);
      setReport(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate report');
    }
    setLoading(false);
  };

  const handleExport = () => {
    if (!report) return;
    const ts = new Date().toISOString().slice(0, 10);

    if (reportType === 'revenue' && report.data) {
      const rows = [
        ['Order Number', 'Customer', 'Amount', 'Status', 'Payment', 'Date'],
        ...report.data.map((r: any) => [r.orderNumber, r.customer || '', r.amount, r.status, r.payment, new Date(r.date).toLocaleDateString()]),
      ];
      exportToCSV(rows, `revenue-report-${ts}.csv`);
    } else if (reportType === 'expense' && report.data) {
      const rows = [
        ['Title', 'Category', 'Amount', 'Date', 'Description'],
        ...report.data.map((r: any) => [r.title, r.category, r.amount, new Date(r.date).toLocaleDateString(), r.description || '']),
      ];
      exportToCSV(rows, `expense-report-${ts}.csv`);
    } else if (reportType === 'salary' && report.data) {
      const rows = [
        ['Employee', 'Employee ID', 'Department', 'Month', 'Total', 'Paid', 'Remaining', 'Status'],
        ...report.data.map((r: any) => [r.employee, r.employeeId, r.department, r.month, r.amount, r.paid, r.remaining, r.status]),
      ];
      exportToCSV(rows, `salary-report-${ts}.csv`);
    } else {
      const rows = [
        ['Metric', 'Amount'],
        ['Revenue', report.revenue],
        ['Expenses', report.expenses],
        ['Salaries Paid', report.salariesPaid],
        ['Net Profit', report.netProfit],
        ['Profit Margin (%)', report.profitMargin],
      ];
      exportToCSV(rows, `profit-loss-report-${ts}.csv`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Financial Reports</h1>
        <p className="text-stone-500 text-sm mt-1">Generate and export reports for any time period</p>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {REPORT_TYPES.map(rt => (
          <button key={rt.value} onClick={() => { setReportType(rt.value); setReport(null); }}
            className={`text-left rounded-xl border-2 p-4 transition-all ${reportType === rt.value ? 'border-organic-400 bg-organic-50' : 'border-stone-200 bg-white hover:border-organic-200'}`}
          >
            <p className={`font-semibold text-sm ${reportType === rt.value ? 'text-organic-700' : 'text-stone-800'}`}>{rt.label}</p>
            <p className="text-xs text-stone-400 mt-0.5">{rt.desc}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-medium text-stone-700 mb-4">Filter Options</h3>
        <div className="flex flex-wrap gap-4 items-end">
          {reportType !== 'salary' ? (
            <>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs text-stone-500 mb-1">Month (optional)</label>
              <input type="month" value={month} onChange={e => setMonth(e.target.value)}
                className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400"
              />
            </div>
          )}
          <button onClick={handleGenerate} disabled={loading}
            className="px-5 py-2 bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          {report && (
            <button onClick={handleExport}
              className="px-5 py-2 border border-organic-400 text-organic-700 hover:bg-organic-50 text-sm font-medium rounded-lg"
            >
              Export CSV
            </button>
          )}
          {(startDate || endDate || month) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); setMonth(''); }}
              className="px-4 py-2 border border-stone-300 text-stone-600 hover:bg-stone-50 text-sm rounded-lg"
            >Clear Filters</button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">{error}</div>}

      {/* Results */}
      {report && (
        <div className="space-y-5">
          {/* Summary Cards */}
          {reportType === 'profit_loss' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Revenue', value: rs(report.revenue), color: 'text-stone-800' },
                { label: 'Expenses', value: rs(report.expenses), color: 'text-red-600' },
                { label: 'Salaries Paid', value: rs(report.salariesPaid), color: 'text-red-600' },
                { label: 'Net Profit', value: rs(report.netProfit), color: report.netProfit >= 0 ? 'text-organic-700' : 'text-red-700' },
                { label: 'Profit Margin', value: `${report.profitMargin}%`, color: report.netProfit >= 0 ? 'text-organic-700' : 'text-red-700' },
                { label: 'Monthly Salary Budget', value: rs(report.monthlySalaryBudget), color: 'text-stone-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4">
                  <p className="text-xs text-stone-500 mb-1">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {reportType === 'revenue' && report.summary && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-organic-700">{rs(report.summary.total)}</p>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-stone-800">{report.summary.count}</p>
              </div>
            </div>
          )}

          {reportType === 'expense' && report.summary && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{rs(report.summary.total)}</p>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Records</p>
                <p className="text-2xl font-bold text-stone-800">{report.summary.count}</p>
              </div>
              {report.by_category && report.by_category.length > 0 && (
                <div className="col-span-2 bg-white rounded-xl border border-stone-200 p-4">
                  <p className="text-sm font-semibold text-stone-700 mb-3">By Category</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[...report.by_category].sort((a: any, b: any) => b.amount - a.amount).map((c: any) => (
                      <div key={c.category} className="flex items-center justify-between bg-earth-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-stone-600">{c.category}</span>
                        <span className="text-xs font-semibold text-stone-800">{rs(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {reportType === 'salary' && report.summary && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Total Payable</p>
                <p className="text-xl font-bold text-stone-800">{rs(report.summary.totalPayable)}</p>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Total Paid</p>
                <p className="text-xl font-bold text-green-700">{rs(report.summary.totalPaid)}</p>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Total Pending</p>
                <p className="text-xl font-bold text-red-600">{rs(report.summary.totalPending)}</p>
              </div>
            </div>
          )}

          {/* Data Table */}
          {report.data && report.data.length > 0 && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-700">{report.data.length} records</span>
                <button onClick={handleExport} className="text-xs text-organic-600 hover:underline font-medium">Export CSV</button>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-earth-50 border-b border-stone-200 sticky top-0">
                    <tr>
                      {reportType === 'revenue' && ['Order #', 'Customer', 'Amount', 'Status', 'Payment', 'Date'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-stone-600 uppercase">{h}</th>
                      ))}
                      {reportType === 'expense' && ['Title', 'Category', 'Amount', 'Date', 'Description'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-stone-600 uppercase">{h}</th>
                      ))}
                      {reportType === 'salary' && ['Employee', 'Dept', 'Month', 'Total', 'Paid', 'Remaining', 'Status'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-stone-600 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {report.data.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-earth-50 text-sm">
                        {reportType === 'revenue' && (
                          <>
                            <td className="px-3 py-2 font-medium text-stone-800">{row.orderNumber}</td>
                            <td className="px-3 py-2 text-stone-600">{row.customer || '—'}</td>
                            <td className="px-3 py-2 font-semibold text-stone-800">{rs(row.amount)}</td>
                            <td className="px-3 py-2 text-stone-500 capitalize">{row.status}</td>
                            <td className="px-3 py-2 text-stone-500 capitalize">{row.payment}</td>
                            <td className="px-3 py-2 text-stone-500">{new Date(row.date).toLocaleDateString()}</td>
                          </>
                        )}
                        {reportType === 'expense' && (
                          <>
                            <td className="px-3 py-2 font-medium text-stone-800">{row.title}</td>
                            <td className="px-3 py-2 text-stone-600">{row.category}</td>
                            <td className="px-3 py-2 font-semibold text-stone-800">{rs(row.amount)}</td>
                            <td className="px-3 py-2 text-stone-500">{new Date(row.date).toLocaleDateString()}</td>
                            <td className="px-3 py-2 text-stone-400 max-w-[150px] truncate">{row.description || '—'}</td>
                          </>
                        )}
                        {reportType === 'salary' && (
                          <>
                            <td className="px-3 py-2 font-medium text-stone-800">{row.employee}</td>
                            <td className="px-3 py-2 text-stone-600">{row.department}</td>
                            <td className="px-3 py-2 text-stone-600">{row.month}</td>
                            <td className="px-3 py-2 text-stone-800">{rs(row.amount)}</td>
                            <td className="px-3 py-2 text-green-700">{rs(row.paid)}</td>
                            <td className="px-3 py-2 text-red-600">{rs(row.remaining)}</td>
                            <td className="px-3 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.status === 'Paid' ? 'bg-green-100 text-green-800' : row.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
