const mongoose = require('mongoose');

const CATEGORIES = ['Sauces', 'Sweeteners', 'Oils', 'Spices', 'Grains', 'Dairy', 'Other'];

const ProductSchema = new mongoose.Schema({
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: CATEGORIES },
  description: { type: String, required: true },
  cost_price: { type: Number, required: true, min: 0 },
  selling_price: { type: Number, required: true, min: 0 },
  stock_quantity: { type: Number, required: true, min: 0, default: 0 },
  image_url: { type: String, default: '' },
  is_listed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', ProductSchema);
