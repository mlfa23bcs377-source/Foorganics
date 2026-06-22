const mongoose = require('mongoose');

const DEPARTMENTS = ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance', 'Operations', 'IT', 'Management'];
const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract'];
const GENDERS = ['Male', 'Female', 'Other'];
const STATUSES = ['Active', 'Inactive'];

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  gender: { type: String, enum: GENDERS, required: true },
  dateOfBirth: { type: Date, default: null },
  designation: { type: String, required: true, trim: true },
  department: { type: String, required: true, enum: DEPARTMENTS },
  joiningDate: { type: Date, default: Date.now },
  address: { type: String, default: '' },
  salary: { type: Number, required: true, min: 0 },
  employmentType: { type: String, required: true, enum: EMPLOYMENT_TYPES },
  status: { type: String, enum: STATUSES, default: 'Active' },
  profileImage: { type: String, default: '' },
}, { timestamps: true });

EmployeeSchema.pre('save', async function (next) {
  if (this.isNew && !this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Employee', EmployeeSchema);
