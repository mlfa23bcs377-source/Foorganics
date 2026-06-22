const Expense = require('../models/Expense');

const fmt = (e) => ({
  id: e._id.toString(),
  title: e.title,
  category: e.category,
  amount: e.amount,
  description: e.description || '',
  expenseDate: e.expenseDate,
  createdAt: e.createdAt,
});

exports.create = async (req, res) => {
  try {
    const { title, category, amount, description, expenseDate } = req.body;
    const expense = await Expense.create({
      title, category, amount, description,
      expenseDate: expenseDate || new Date(),
      createdBy: req.user.id,
    });
    res.status(201).json(fmt(expense));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      filter.expenseDate = {};
      if (startDate) filter.expenseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.expenseDate.$lte = end;
      }
    }

    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .sort({ expenseDate: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ expenses: expenses.map(fmt), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(fmt(expense));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(fmt(expense));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
