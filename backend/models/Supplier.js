const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contact_person: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, default: null, trim: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Supplier', SupplierSchema);
