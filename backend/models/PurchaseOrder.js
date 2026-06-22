const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit_cost: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['ordered', 'received'], default: 'ordered' },
  ordered_at: { type: Date, default: Date.now },
  received_at: { type: Date, default: null },
});

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
