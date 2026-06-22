const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: {
    type: String, required: true,
    enum: ['Rent', 'Utilities', 'Internet', 'Marketing', 'Transportation', 'Inventory', 'Employee Salary', 'Maintenance', 'Office Supplies', 'Other'],
  },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
  expenseDate: { type: Date, required: true, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
