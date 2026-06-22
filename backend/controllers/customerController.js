const Customer = require('../models/Customer');
const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');

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

const fmtOrder = (o) => {
  const obj = o.toObject ? o.toObject() : o;
  return {
    id: obj._id.toString(),
    orderNumber: obj.orderNumber,
    trackingNumber: obj.trackingNumber,
    order_status: obj.order_status,
    payment_status: obj.payment_status,
    payment_method: obj.payment_method,
    total_amount: obj.total_amount,
    order_date: obj.order_date,
    customer_name: obj.customer_name,
    address: obj.address,
    shippingAddress: obj.shippingAddress,
    statusHistory: obj.statusHistory || [],
    order_items: (obj.order_items || []).map((item) => ({
      id: item._id.toString(),
      product_id: item.product_id?._id?.toString() || item.product_id?.toString(),
      quantity: item.quantity,
      unit_price: item.unit_price,
      product: item.product_id?._id ? {
        id: item.product_id._id.toString(),
        name: item.product_id.name,
        image_url: item.product_id.image_url || '',
        category: item.product_id.category,
      } : null,
    })),
  };
};

exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(fmtCustomer(customer));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.customer.id,
      { fullName, phone },
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(fmtCustomer(customer));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'All fields required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (confirmPassword && newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const customer = await Customer.findById(req.customer.id);
    if (!(await customer.comparePassword(currentPassword))) return res.status(401).json({ message: 'Current password is incorrect' });

    customer.password = newPassword;
    await customer.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    await Customer.findByIdAndUpdate(req.customer.id, { profileImage: url });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { title, address, city, state, postalCode, country } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.customer.id,
      { $push: { addresses: { title, address, city, state, postalCode, country } } },
      { new: true }
    );
    res.json(fmtCustomer(customer));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.customer.id, 'addresses._id': addressId },
      { $set: { 'addresses.$': { ...req.body, _id: addressId } } },
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: 'Address not found' });
    res.json(fmtCustomer(customer));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const customer = await Customer.findByIdAndUpdate(
      req.customer.id,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );
    res.json(fmtCustomer(customer));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { search = '', status = '', page = 1, limit = 10 } = req.query;
    const filter = { customer: req.customer.id };
    if (status) filter.order_status = status;
    if (search) filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { trackingNumber: { $regex: search, $options: 'i' } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('order_items.product_id').sort({ order_date: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ orders: orders.map(fmtOrder), total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.customer.id }).populate('order_items.product_id');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(fmtOrder(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const [total, completed, pending, cancelled, revenue] = await Promise.all([
      Order.countDocuments({ customer: customerId }),
      Order.countDocuments({ customer: customerId, order_status: 'delivered' }),
      Order.countDocuments({ customer: customerId, order_status: { $in: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery'] } }),
      Order.countDocuments({ customer: customerId, order_status: 'cancelled' }),
      Order.find({ customer: customerId, payment_status: 'paid' }).select('total_amount'),
    ]);
    const totalSpent = revenue.reduce((sum, o) => sum + Number(o.total_amount), 0);
    res.json({ totalOrders: total, completedOrders: completed, pendingOrders: pending, cancelledOrders: cancelled, totalSpent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const { identifier } = req.params;
    const order = await Order.findOne({
      $or: [
        { orderNumber: identifier.toUpperCase() },
        { trackingNumber: identifier.toUpperCase() },
      ],
    }).populate('order_items.product_id');
    if (!order) return res.status(404).json({ message: 'Order not found. Check your order or tracking number.' });
    res.json(fmtOrder(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
