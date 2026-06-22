const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

const fmtSupplier = (s) =>
  s ? { id: s._id.toString(), name: s.name, contact_person: s.contact_person, phone: s.phone, email: s.email || null, created_at: s.created_at } : null;

const fmtProduct = (p) =>
  p ? { id: p._id.toString(), name: p.name, category: p.category, description: p.description, cost_price: p.cost_price, selling_price: p.selling_price, stock_quantity: p.stock_quantity, image_url: p.image_url || '', is_listed: p.is_listed, created_at: p.created_at, supplier_id: p.supplier_id ? p.supplier_id.toString() : null } : null;

const fmt = (doc) => {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    supplier_id: o.supplier_id && o.supplier_id._id ? o.supplier_id._id.toString() : o.supplier_id?.toString() || null,
    product_id: o.product_id && o.product_id._id ? o.product_id._id.toString() : o.product_id?.toString() || null,
    quantity: o.quantity,
    unit_cost: o.unit_cost,
    status: o.status,
    ordered_at: o.ordered_at,
    received_at: o.received_at || null,
    supplier: o.supplier_id && o.supplier_id._id ? fmtSupplier(o.supplier_id) : null,
    product: o.product_id && o.product_id._id ? fmtProduct(o.product_id) : null,
  };
};

exports.getAll = async (_req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('supplier_id')
      .populate('product_id')
      .sort({ ordered_at: -1 });
    res.json(orders.map(fmt));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { supplier_id, product_id, quantity, unit_cost } = req.body;
    const po = await PurchaseOrder.create({ supplier_id, product_id, quantity, unit_cost, status: 'ordered' });
    const populated = await PurchaseOrder.findById(po._id).populate('supplier_id').populate('product_id');
    res.status(201).json(fmt(populated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.receive = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase order not found' });
    if (po.status === 'received') return res.status(400).json({ message: 'Already received' });

    po.status = 'received';
    po.received_at = new Date();
    await po.save();

    await Product.findByIdAndUpdate(po.product_id, {
      $inc: { stock_quantity: po.quantity },
      $set: { cost_price: po.unit_cost },
    });

    res.json({ message: 'Purchase order marked as received' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
