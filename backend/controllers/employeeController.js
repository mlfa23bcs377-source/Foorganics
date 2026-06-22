const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const path = require('path');
const fs = require('fs');

const fmt = (doc) => {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    employeeId: o.employeeId,
    fullName: o.fullName,
    email: o.email,
    phone: o.phone,
    gender: o.gender,
    dateOfBirth: o.dateOfBirth,
    designation: o.designation,
    department: o.department,
    joiningDate: o.joiningDate,
    address: o.address,
    salary: o.salary,
    employmentType: o.employmentType,
    status: o.status,
    profileImage: o.profileImage || '',
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
};

exports.getAll = async (req, res) => {
  try {
    const { search = '', department = '', status = '', page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) filter.department = department;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [employees, total] = await Promise.all([
      Employee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Employee.countDocuments(filter),
    ]);

    res.json({
      employees: employees.map(fmt),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const [totalDays, presentDays, attendanceThisMonth] = await Promise.all([
      Attendance.countDocuments({ employeeId: employee._id }),
      Attendance.countDocuments({ employeeId: employee._id, status: 'Present' }),
      Attendance.find({ employeeId: employee._id, date: { $gte: monthStart } })
        .sort({ date: -1 })
        .limit(31),
    ]);

    res.json({
      ...fmt(employee),
      stats: { totalDays, presentDays },
      recentAttendance: attendanceThisMonth.map((a) => ({
        id: a._id.toString(),
        date: a.date,
        checkInTime: a.checkInTime,
        checkOutTime: a.checkOutTime,
        workingHours: a.workingHours,
        status: a.status,
        remarks: a.remarks,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(fmt(employee));
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(fmt(employee));
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    await Attendance.deleteMany({ employeeId: req.params.id });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProfileImage = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ message: 'filename required' });
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const [totalEmployees, activeEmployees, presentToday, absentToday, salaryStat] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Attendance.countDocuments({ date: { $gte: today, $lte: todayEnd }, status: 'Present' }),
      Attendance.countDocuments({ date: { $gte: today, $lte: todayEnd }, status: 'Absent' }),
      Employee.aggregate([{ $group: { _id: null, total: { $sum: '$salary' } } }]),
    ]);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const totalPossible = await Attendance.countDocuments({ date: { $gte: monthStart } });
    const totalPresent = await Attendance.countDocuments({ date: { $gte: monthStart }, status: { $in: ['Present', 'Half Day'] } });
    const monthlyAttendancePct = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

    res.json({
      totalEmployees,
      activeEmployees,
      presentToday,
      absentToday,
      monthlyAttendancePct,
      totalSalaryExpense: salaryStat[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
