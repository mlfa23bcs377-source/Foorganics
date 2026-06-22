const mongoose = require('mongoose');

const STATUSES = ['Present', 'Absent', 'Half Day', 'Leave'];

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkInTime: { type: String, default: '' },
  checkOutTime: { type: String, default: '' },
  workingHours: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: STATUSES, required: true },
  remarks: { type: String, default: '' },
}, { timestamps: true });

// One attendance record per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
