const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

const fmtSupplier = (sup) => {
  if (!sup) return null;
  return {
    id: sup._id.toString(),
    name: sup.name,
    contact_person: sup.contact_person,
    phone: sup.phone,
    email: sup.email || null,
    created_at: sup.created_at,
  };
};

const fmt = (doc, populated = false) => {
  const o = doc.toObject ? doc.toObject() : doc;
  const result = {
    id: o._id.toString(),
    name: o.name,
    category: o.category,
    description: o.description,
    cost_price: o.cost_price,
    selling_price: o.selling_price,
    stock_quantity: o.stock_quantity,
    image_url: o.image_url || '',
    is_listed: o.is_listed,
    created_at: o.created_at,
    supplier_id: o.supplier_id
      ? typeof o.supplier_id === 'object' && o.supplier_id._id
        ? o.supplier_id._id.toString()
        : o.supplier_id.toString()
      : null,
  };
  if (populated && o.supplier_id && typeof o.supplier_id === 'object' && o.supplier_id._id) {
    result.supplier = fmtSupplier(o.supplier_id);
  }
  return result;
};

exports.getListed = async (_req, res) => {
  try {
    const products = await Product.find({ is_listed: true }).sort({ created_at: -1 });
    res.json(products.map((p) => fmt(p)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getListedById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, is_listed: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(fmt(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (_req, res) => {
  try {
    const products = await Product.find().populate('supplier_id').sort({ created_at: -1 });
    res.json(products.map((p) => fmt(p, true)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const populated = await Product.findById(product._id).populate('supplier_id');
    res.status(201).json(fmt(populated, true));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('supplier_id');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(fmt(product, true));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleListed = async (req, res) => {
  try {
    const { is_listed } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { is_listed },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteImage = async (req, res) => {
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
    const [total, listed] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ is_listed: true }),
    ]);
    res.json({ totalProducts: total, listedProducts: listed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
