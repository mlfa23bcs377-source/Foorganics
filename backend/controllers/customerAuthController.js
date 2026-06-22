const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Customer = require('../models/Customer');

const signToken = (id, email) =>
  jwt.sign({ id, email, role: 'customer' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const fmtCustomer = (c) => ({
  id: c._id.toString(),
  fullName: c.fullName,
  email: c.email,
  phone: c.phone,
  profileImage: c.profileImage || '',
  isVerified: c.isVerified,
  status: c.status,
  addresses: (c.addresses || []).map((a) => ({
    id: a._id.toString(), title: a.title, address: a.address,
    city: a.city, state: a.state, postalCode: a.postalCode, country: a.country,
  })),
  createdAt: c.createdAt,
});

exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'fullName, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (confirmPassword !== undefined && password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const exists = await Customer.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const customer = await Customer.create({ fullName, email, phone: phone || '', password });
    const token = signToken(customer._id, customer.email);
    res.status(201).json({ token, customer: fmtCustomer(customer) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer || !(await customer.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (customer.status === 'blocked')
      return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });

    const token = signToken(customer._id, customer.email);
    res.json({ token, customer: fmtCustomer(customer) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Account not found' });
    res.json(fmtCustomer(customer));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      // Don't leak whether the email exists
      return res.json({ message: 'If that email exists, a reset link has been generated.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    customer.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    customer.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await customer.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;

    // NOTE: In production configure SMTP and send resetUrl via email.
    // For development the reset URL is returned directly:
    res.json({
      message: 'Password reset link generated.',
      resetUrl,
      dev_note: 'In production this URL is sent by email. Copy it to reset your password.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (confirmPassword !== undefined && password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const customer = await Customer.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!customer) return res.status(400).json({ message: 'Reset token is invalid or has expired' });

    customer.password = password;
    customer.passwordResetToken = null;
    customer.passwordResetExpires = null;
    await customer.save();

    const jwtToken = signToken(customer._id, customer.email);
    res.json({ message: 'Password reset successful', token: jwtToken, customer: fmtCustomer(customer) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
