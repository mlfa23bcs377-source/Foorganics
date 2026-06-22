const Order = require('../models/Order');
const Product = require('../models/Product');

const fmtProduct = (p) =>
  p ? { id: p._id.toString(), name: p.name, category: p.category, description: p.description, cost_price: p.cost_price, selling_price: p.selling_price, stock_quantity: p.stock_quantity, image_url: p.image_url || '', is_listed: p.is_listed, created_at: p.created_at, supplier_id: p.supplier_id ? p.supplier_id.toString() : null } : null;

const fmtItem = (item, orderId) => ({
  id: item._id.toString(),
  order_id: orderId,
  product_id: item.product_id && item.product_id._id ? item.product_id._id.toString() : item.product_id?.toString() || null,
  quantity: item.quantity,
  unit_price: item.unit_price,
  product: item.product_id && item.product_id._id ? fmtProduct(item.product_id) : undefined,
});

const fmt = (doc) => {
  const o = doc.toObject ? doc.toObject() : doc;
  const orderId = o._id.toString();
  return {
    id: orderId,
    orderNumber: o.orderNumber,
    trackingNumber: o.trackingNumber,
    customer_name: o.customer_name,
    phone_number: o.phone_number,
    address: o.address,
    total_amount: o.total_amount,
    order_status: o.order_status,
    payment_status: o.payment_status,
    payment_method: o.payment_method || null,
    order_date: o.order_date,
    isGuestOrder: o.isGuestOrder,
    statusHistory: o.statusHistory || [],
    order_items: (o.order_items || []).map((item) => fmtItem(item, orderId)),
  };
};

exports.create = async (req, res) => {
  try {
    const { customer_name, phone_number, address, payment_method, items } = req.body;

    if (!items || !items.length)
      return res.status(400).json({ message: 'Order must have at least one item' });

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product)
        return res.status(400).json({ message: `Product not found: ${item.product_id}` });
      if (!product.is_listed)
        return res.status(400).json({ message: `Product not available: ${product.name}` });
      if (product.stock_quantity < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });

      const unit_price = product.selling_price;
      totalAmount += unit_price * item.quantity;
      orderItems.push({ product_id: product._id, quantity: item.quantity, unit_price });
    }

    const payment_status = payment_method === 'card_mock' ? 'paid' : 'unpaid';

    // Support optional customer account linking
    const { customerId, guestEmail, shippingAddress } = req.body;
    const isGuestOrder = !customerId;

    const order = await Order.create({
      customer_name,
      phone_number,
      address,
      total_amount: totalAmount,
      subtotal: totalAmount,
      shippingFee: 0,
      order_status: 'pending',
      payment_status,
      payment_method,
      order_date: new Date(),
      order_items: orderItems,
      // Customer linking
      customer: customerId || null,
      isGuestOrder,
      guestInfo: isGuestOrder ? { name: customer_name, email: guestEmail || '', phone: phone_number } : {},
      shippingAddress: shippingAddress || { address, city: '', state: '', postalCode: '', country: 'Pakistan' },
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock_quantity: -item.quantity },
      });
    }

    res.status(201).json({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate('order_items.product_id')
      .sort({ order_date: -1 });
    res.json(orders.map(fmt));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('order_items.product_id');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(fmt(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { order_status, note } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, {
      order_status,
      $push: { statusHistory: { status: order_status, timestamp: new Date(), note: note || '' } },
    }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { payment_status: 'paid' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Marked as paid' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (_req, res) => {
  try {
    const [totalProducts, listedProducts, totalOrders, pendingOrders, paidOrders] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ is_listed: true }),
      Order.countDocuments(),
      Order.countDocuments({ order_status: 'pending' }),
      Order.find({ payment_status: 'paid' }).select('total_amount'),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    res.json({ totalProducts, listedProducts, totalOrders, pendingOrders, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
