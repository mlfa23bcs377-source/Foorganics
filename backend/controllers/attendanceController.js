const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const calcWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const [ih, im] = checkIn.split(':').map(Number);
  const [oh, om] = checkOut.split(':').map(Number);
  const diff = (oh * 60 + om) - (ih * 60 + im);
  return diff > 0 ? parseFloat((diff / 60).toFixed(2)) : 0;
};

const fmtEmployee = (e) =>
  e ? { id: e._id.toString(), employeeId: e.employeeId, fullName: e.fullName, department: e.department, designation: e.designation, profileImage: e.profileImage || '' } : null;

const fmt = (doc) => {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    employeeId: o.employeeId && o.employeeId._id ? o.employeeId._id.toString() : o.employeeId?.toString() || null,
    date: o.date,
    checkInTime: o.checkInTime,
    checkOutTime: o.checkOutTime,
    workingHours: o.workingHours,
    status: o.status,
    remarks: o.remarks,
    createdAt: o.createdAt,
    employee: o.employeeId && o.employeeId._id ? fmtEmployee(o.employeeId) : null,
  };
};

exports.getAll = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status, date, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: d, $lte: dEnd };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [records, total] = await Promise.all([
      Attendance.find(filter).populate('employeeId').sort({ date: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Attendance.countDocuments(filter),
    ]);

    res.json({
      records: records.map(fmt),
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
    const record = await Attendance.findById(req.params.id).populate('employeeId');
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(fmt(record));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { employeeId, date, checkInTime, checkOutTime, status, remarks } = req.body;
    const workingHours = status === 'Present' ? calcWorkingHours(checkInTime, checkOutTime) : (status === 'Half Day' ? 4 : 0);

    const record = await Attendance.create({ employeeId, date, checkInTime, checkOutTime, workingHours, status, remarks });
    const populated = await Attendance.findById(record._id).populate('employeeId');
    res.status(201).json(fmt(populated));
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Attendance already marked for this employee on this date' });
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { checkInTime, checkOutTime, status, remarks } = req.body;
    const workingHours = status === 'Present' ? calcWorkingHours(checkInTime, checkOutTime) : (status === 'Half Day' ? 4 : 0);

    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { checkInTime, checkOutTime, workingHours, status, remarks },
      { new: true, runValidators: true }
    ).populate('employeeId');
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(fmt(record));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) - 1 || new Date().getMonth();

    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const employees = await Employee.find({ status: 'Active' });
    const records = await Attendance.find({ date: { $gte: startDate, $lte: endDate } });

    const recordMap = {};
    for (const r of records) {
      const key = r.employeeId.toString();
      if (!recordMap[key]) recordMap[key] = { present: 0, absent: 0, halfDay: 0, leave: 0, totalHours: 0 };
      if (r.status === 'Present') recordMap[key].present++;
      else if (r.status === 'Absent') recordMap[key].absent++;
      else if (r.status === 'Half Day') recordMap[key].halfDay++;
      else if (r.status === 'Leave') recordMap[key].leave++;
      recordMap[key].totalHours += r.workingHours || 0;
    }

    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const report = employees.map((emp) => {
      const stats = recordMap[emp._id.toString()] || { present: 0, absent: 0, halfDay: 0, leave: 0, totalHours: 0 };
      const attendancePct = daysInMonth > 0 ? Math.round(((stats.present + stats.halfDay * 0.5) / daysInMonth) * 100) : 0;
      return {
        employee: fmtEmployee(emp),
        present: stats.present,
        absent: stats.absent,
        halfDay: stats.halfDay,
        leave: stats.leave,
        totalHours: parseFloat(stats.totalHours.toFixed(2)),
        attendancePct,
        daysInMonth,
      };
    });

    res.json({ year: y, month: m + 1, report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEmployeeReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const filter = { employeeId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [records, total, stats] = await Promise.all([
      Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
      Attendance.countDocuments(filter),
      Attendance.aggregate([
        { $match: { employeeId: employee._id, ...( filter.date ? { date: filter.date } : {} ) } },
        { $group: { _id: '$status', count: { $sum: 1 }, hours: { $sum: '$workingHours' } } },
      ]),
    ]);

    const summary = { present: 0, absent: 0, halfDay: 0, leave: 0, totalHours: 0 };
    for (const s of stats) {
      if (s._id === 'Present') { summary.present = s.count; summary.totalHours += s.hours; }
      else if (s._id === 'Absent') summary.absent = s.count;
      else if (s._id === 'Half Day') { summary.halfDay = s.count; summary.totalHours += s.hours; }
      else if (s._id === 'Leave') summary.leave = s.count;
    }

    res.json({
      employee: fmtEmployee(employee),
      records: records.map((r) => ({
        id: r._id.toString(),
        date: r.date,
        checkInTime: r.checkInTime,
        checkOutTime: r.checkOutTime,
        workingHours: r.workingHours,
        status: r.status,
        remarks: r.remarks,
      })),
      summary,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
