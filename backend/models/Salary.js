const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true }, // YYYY-MM
  salaryAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  remainingAmount: { type: Number, default: 0, min: 0 },
  paymentStatus: { type: String, enum: ['Paid', 'Partial', 'Pending'], default: 'Pending' },
  paymentDate: { type: Date },
  notes: { type: String, trim: true },
}, { timestamps: true });

SalarySchema.index({ employeeId: 1, month: 1 }, { unique: true });

SalarySchema.pre('save', function (next) {
  this.remainingAmount = Math.max(0, this.salaryAmount - this.paidAmount);
  if (this.paidAmount >= this.salaryAmount) {
    this.paymentStatus = 'Paid';
    if (!this.paymentDate) this.paymentDate = new Date();
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'Partial';
  } else {
    this.paymentStatus = 'Pending';
  }
  next();
});

module.exports = mongoose.model('Salary', SalarySchema);
