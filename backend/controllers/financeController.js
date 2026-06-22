const Order = require('../models/Order');
const Employee = require('../models/Employee');
const Product = require('../models/Product');
const PurchaseOrder = require('../models/PurchaseOrder');
const Expense = require('../models/Expense');
const Salary = require('../models/Salary');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NON_CANCELLED = { order_status: { $nin: ['cancelled', 'returned', 'refunded'] } };

function dateRange(period) {
  const now = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (period === 'today') return { $gte: start, $lte: now };
  if (period === 'week') { start.setDate(start.getDate() - start.getDay()); return { $gte: start, $lte: now }; }
  if (period === 'month') { start.setDate(1); return { $gte: start, $lte: now }; }
  if (period === 'year') { start.setMonth(0, 1); return { $gte: start, $lte: now }; }
  return null;
}

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();

    // ── Revenue ──────────────────────────────────────────────────────────
    const [allOrders, todayOrders, weekOrders, monthOrders, yearOrders, monthlyAgg] = await Promise.all([
      Order.find(NON_CANCELLED).select('total_amount order_date'),
      Order.find({ ...NON_CANCELLED, order_date: dateRange('today') }).select('total_amount'),
      Order.find({ ...NON_CANCELLED, order_date: dateRange('week') }).select('total_amount'),
      Order.find({ ...NON_CANCELLED, order_date: dateRange('month') }).select('total_amount'),
      Order.find({ ...NON_CANCELLED, order_date: dateRange('year') }).select('total_amount'),
      Order.aggregate([
        { $match: NON_CANCELLED },
        { $group: { _id: { year: { $year: '$order_date' }, month: { $month: '$order_date' } }, revenue: { $sum: '$total_amount' }, orders: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    const sum = (arr) => arr.reduce((s, o) => s + (o.total_amount || 0), 0);
    const totalRevenue = sum(allOrders);
    const monthlyChart = monthlyAgg.map(m => ({
      month: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
      revenue: m.revenue,
      orders: m.orders,
    }));

    // ── Employees ─────────────────────────────────────────────────────────
    const employees = await Employee.find({}).select('salary status');
    const activeEmployees = employees.filter(e => e.status === 'Active');
    const totalMonthlySalary = activeEmployees.reduce((s, e) => s + (e.salary || 0), 0);

    const salaryRecords = await Salary.find({}).select('paidAmount remainingAmount paymentStatus');
    const totalSalaryPaid = salaryRecords.reduce((s, r) => s + (r.paidAmount || 0), 0);
    const totalSalaryPending = salaryRecords
      .filter(r => r.paymentStatus !== 'Paid')
      .reduce((s, r) => s + (r.remainingAmount || 0), 0);

    // ── Inventory ─────────────────────────────────────────────────────────
    const products = await Product.find({}).select('cost_price selling_price stock_quantity');
    const totalInventoryCost = products.reduce((s, p) => s + (p.cost_price || 0) * (p.stock_quantity || 0), 0);
    const totalStockValue = products.reduce((s, p) => s + (p.selling_price || 0) * (p.stock_quantity || 0), 0);
    const lowStockProducts = products.filter(p => (p.stock_quantity || 0) <= 10);
    const lowStockValue = lowStockProducts.reduce((s, p) => s + (p.cost_price || 0) * (p.stock_quantity || 0), 0);

    const purchaseOrders = await PurchaseOrder.find({ status: 'received' }).select('unit_cost quantity');
    const totalPurchaseCost = purchaseOrders.reduce((s, po) => s + (po.unit_cost || 0) * (po.quantity || 0), 0);

    // ── Expenses ──────────────────────────────────────────────────────────
    const expenses = await Expense.find({}).select('amount category expenseDate');
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const monthlyExpenses = expenses
      .filter(e => new Date(e.expenseDate) >= monthStart)
      .reduce((s, e) => s + (e.amount || 0), 0);

    const OPERATING_CATS = new Set(['Rent', 'Utilities', 'Internet', 'Marketing', 'Transportation', 'Maintenance', 'Office Supplies']);
    const operatingExpenses = expenses.filter(e => OPERATING_CATS.has(e.category)).reduce((s, e) => s + (e.amount || 0), 0);
    const otherExpenses = expenses.filter(e => e.category === 'Other').reduce((s, e) => s + (e.amount || 0), 0);

    // Category breakdown
    const catMap = {};
    expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + (e.amount || 0); });
    const expenseCategoryChart = Object.entries(catMap).map(([category, amount]) => ({ category, amount }));

    // ── Profit ────────────────────────────────────────────────────────────
    const salaryExpense = totalSalaryPaid;
    const totalDeductions = salaryExpense + totalPurchaseCost + totalExpenses;
    const netProfit = totalRevenue - totalDeductions;
    const profitMargin = totalRevenue > 0 ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(2)) : 0;

    res.json({
      revenue: {
        total: totalRevenue,
        today: sum(todayOrders),
        weekly: sum(weekOrders),
        monthly: sum(monthOrders),
        annual: sum(yearOrders),
        monthly_chart: monthlyChart,
      },
      employees: {
        total: employees.length,
        active: activeEmployees.length,
        totalMonthlySalary,
        totalPaid: totalSalaryPaid,
        totalPending: totalSalaryPending,
      },
      inventory: {
        totalInvestment: totalInventoryCost,
        totalPurchaseCost,
        totalStockValue,
        lowStockValue,
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
      },
      expenses: {
        total: totalExpenses,
        monthly: monthlyExpenses,
        operating: operatingExpenses,
        other: otherExpenses,
        by_category: expenseCategoryChart,
      },
      profit: {
        grossRevenue: totalRevenue,
        totalDeductions,
        netProfit,
        profitMargin,
        ownerEarnings: netProfit,
        breakdown: {
          revenue: totalRevenue,
          salaries: salaryExpense,
          inventoryCost: totalPurchaseCost,
          operatingExpenses,
          otherExpenses,
          generalExpenses: totalExpenses,
        },
      },
    });
  } catch (err) {
    console.error('Finance dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const { period = 'monthly', year, month } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;

    let matchFilter, groupId, sortKey;

    if (period === 'daily') {
      matchFilter = {
        ...NON_CANCELLED,
        $expr: { $and: [{ $eq: [{ $year: '$order_date' }, targetYear] }, { $eq: [{ $month: '$order_date' }, targetMonth] }] },
      };
      groupId = { day: { $dayOfMonth: '$order_date' }, month: { $month: '$order_date' }, year: { $year: '$order_date' } };
      sortKey = { '_id.day': 1 };
    } else if (period === 'yearly') {
      matchFilter = NON_CANCELLED;
      groupId = { year: { $year: '$order_date' } };
      sortKey = { '_id.year': 1 };
    } else {
      matchFilter = { ...NON_CANCELLED, $expr: { $eq: [{ $year: '$order_date' }, targetYear] } };
      groupId = { month: { $month: '$order_date' }, year: { $year: '$order_date' } };
      sortKey = { '_id.month': 1 };
    }

    const data = await Order.aggregate([
      { $match: matchFilter },
      { $group: { _id: groupId, revenue: { $sum: '$total_amount' }, orders: { $sum: 1 } } },
      { $sort: sortKey },
    ]);

    res.json({ period, year: targetYear, month: targetMonth, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfit = async (req, res) => {
  try {
    const targetYear = parseInt(req.query.year) || new Date().getFullYear();

    const [monthlyRevAgg, monthlyExpAgg] = await Promise.all([
      Order.aggregate([
        { $match: { ...NON_CANCELLED, $expr: { $eq: [{ $year: '$order_date' }, targetYear] } } },
        { $group: { _id: { month: { $month: '$order_date' } }, revenue: { $sum: '$total_amount' }, orders: { $sum: 1 } } },
        { $sort: { '_id.month': 1 } },
      ]),
      Expense.aggregate([
        { $match: { $expr: { $eq: [{ $year: '$expenseDate' }, targetYear] } } },
        { $group: { _id: { month: { $month: '$expenseDate' } }, expenses: { $sum: '$amount' } } },
        { $sort: { '_id.month': 1 } },
      ]),
    ]);

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const rev = monthlyRevAgg.find(m => m._id.month === i + 1);
      const exp = monthlyExpAgg.find(m => m._id.month === i + 1);
      const revenue = rev?.revenue || 0;
      const expenses = exp?.expenses || 0;
      return { month: MONTH_NAMES[i], revenue, expenses, profit: revenue - expenses, orders: rev?.orders || 0 };
    });

    res.json({ year: targetYear, monthly });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { type = 'profit_loss', startDate, endDate, month } = req.query;

    const buildDateFilter = (field) => {
      if (!startDate && !endDate) return {};
      const f = {};
      if (startDate) f.$gte = new Date(startDate);
      if (endDate) { const e = new Date(endDate); e.setHours(23, 59, 59, 999); f.$lte = e; }
      return { [field]: f };
    };

    if (type === 'revenue') {
      const filter = { ...NON_CANCELLED, ...buildDateFilter('order_date') };
      const orders = await Order.find(filter)
        .select('orderNumber total_amount order_date order_status payment_status customer_name')
        .sort({ order_date: -1 })
        .limit(500);
      return res.json({
        type: 'revenue',
        summary: { total: orders.reduce((s, o) => s + (o.total_amount || 0), 0), count: orders.length },
        data: orders.map(o => ({ orderNumber: o.orderNumber || o._id.toString(), amount: o.total_amount, date: o.order_date, status: o.order_status, payment: o.payment_status, customer: o.customer_name })),
      });
    }

    if (type === 'expense') {
      const filter = buildDateFilter('expenseDate');
      const expenses = await Expense.find(filter).sort({ expenseDate: -1 }).limit(500);
      const catMap = {};
      expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
      return res.json({
        type: 'expense',
        summary: { total: expenses.reduce((s, e) => s + e.amount, 0), count: expenses.length },
        by_category: Object.entries(catMap).map(([category, amount]) => ({ category, amount })),
        data: expenses.map(e => ({ id: e._id, title: e.title, category: e.category, amount: e.amount, date: e.expenseDate, description: e.description })),
      });
    }

    if (type === 'salary') {
      const filter = month ? { month } : {};
      const salaries = await Salary.find(filter).populate('employeeId').sort({ month: -1 });
      return res.json({
        type: 'salary',
        summary: {
          totalPayable: salaries.reduce((s, r) => s + (r.salaryAmount || 0), 0),
          totalPaid: salaries.reduce((s, r) => s + (r.paidAmount || 0), 0),
          totalPending: salaries.reduce((s, r) => s + (r.remainingAmount || 0), 0),
          count: salaries.length,
        },
        data: salaries.map(s => ({
          employee: s.employeeId?.fullName || 'N/A',
          employeeId: s.employeeId?.employeeId || 'N/A',
          department: s.employeeId?.department || 'N/A',
          month: s.month,
          amount: s.salaryAmount,
          paid: s.paidAmount,
          remaining: s.remainingAmount,
          status: s.paymentStatus,
          paymentDate: s.paymentDate,
        })),
      });
    }

    // profit_loss
    const [orders, expenses, salaryRecs, activeEmps] = await Promise.all([
      Order.find({ ...NON_CANCELLED, ...buildDateFilter('order_date') }).select('total_amount'),
      Expense.find(buildDateFilter('expenseDate')).select('amount category'),
      Salary.find({}).select('paidAmount remainingAmount'),
      Employee.find({ status: 'Active' }).select('salary'),
    ]);

    const revenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const salaryPaid = salaryRecs.reduce((s, r) => s + (r.paidAmount || 0), 0);
    const salaryPending = salaryRecs.reduce((s, r) => s + (r.remainingAmount || 0), 0);
    const monthlySalaryBudget = activeEmps.reduce((s, e) => s + (e.salary || 0), 0);

    res.json({
      type: 'profit_loss',
      revenue,
      expenses: totalExpenses,
      salariesPaid: salaryPaid,
      salariesPending: salaryPending,
      monthlySalaryBudget,
      netProfit: revenue - totalExpenses - salaryPaid,
      profitMargin: revenue > 0 ? parseFloat(((revenue - totalExpenses - salaryPaid) / revenue * 100).toFixed(2)) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
