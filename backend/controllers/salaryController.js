const Salary = require('../models/Salary');
const Employee = require('../models/Employee');

const fmt = (s) => ({
  id: s._id.toString(),
  employee: s.employeeId && typeof s.employeeId === 'object' ? {
    id: s.employeeId._id.toString(),
    fullName: s.employeeId.fullName || '',
    employeeId: s.employeeId.employeeId || '',
    designation: s.employeeId.designation || '',
    department: s.employeeId.department || '',
    profileImage: s.employeeId.profileImage || null,
  } : null,
  month: s.month,
  salaryAmount: s.salaryAmount,
  paidAmount: s.paidAmount,
  remainingAmount: s.remainingAmount,
  paymentStatus: s.paymentStatus,
  paymentDate: s.paymentDate || null,
  notes: s.notes || '',
  createdAt: s.createdAt,
});

exports.create = async (req, res) => {
  try {
    const { employeeId, month, salaryAmount, paidAmount, notes } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const salary = await Salary.create({
      employeeId,
      month,
      salaryAmount: salaryAmount !== undefined ? salaryAmount : employee.salary,
      paidAmount: paidAmount || 0,
      notes,
    });
    const populated = await Salary.findById(salary._id).populate('employeeId');
    res.status(201).json(fmt(populated));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Salary record already exists for this employee and month' });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { month, status, employeeId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (status && status !== 'all') filter.paymentStatus = status;
    if (employeeId) filter.employeeId = employeeId;

    const total = await Salary.countDocuments(filter);
    const records = await Salary.find(filter)
      .populate('employeeId')
      .sort({ month: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ salaries: records.map(fmt), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const record = await Salary.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const allowed = ['paidAmount', 'salaryAmount', 'notes', 'paymentDate'];
    allowed.forEach(k => { if (req.body[k] !== undefined) record[k] = req.body[k]; });
    await record.save();

    const populated = await Salary.findById(record._id).populate('employeeId');
    res.json(fmt(populated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.bulkCreateForMonth = async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) return res.status(400).json({ message: 'month is required (YYYY-MM)' });

    const employees = await Employee.find({ status: 'Active' });
    let created = 0;
    let skipped = 0;

    for (const emp of employees) {
      try {
        await Salary.create({ employeeId: emp._id, month, salaryAmount: emp.salary || 0, paidAmount: 0 });
        created++;
      } catch (e) {
        if (e.code === 11000) skipped++;
        else throw e;
      }
    }

    res.json({ message: `Created ${created} records, ${skipped} already existed`, created, skipped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
