const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'packed',
  'shipped', 'out_for_delivery', 'delivered',
  'cancelled', 'returned', 'refunded',
];

const OrderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true, min: 0 },
});

const ShippingAddressSchema = new mongoose.Schema({
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country: { type: String, default: 'Pakistan' },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  // ── New fields ────────────────────────────────────────────────────────────
  orderNumber: { type: String, unique: true, sparse: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  isGuestOrder: { type: Boolean, default: true },
  guestInfo: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  shippingAddress: { type: ShippingAddressSchema, default: () => ({}) },
  subtotal: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  trackingNumber: { type: String, default: null },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  }],

  // ── Existing fields (kept for admin panel compatibility) ──────────────────
  customer_name: { type: String, required: true, trim: true },
  phone_number: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  total_amount: { type: Number, required: true, min: 0 },
  order_status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  payment_status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  payment_method: { type: String, enum: ['cod', 'card_mock'], default: null },
  order_date: { type: Date, default: Date.now },
  order_items: [OrderItemSchema],
});

// Auto-generate orderNumber before first save
OrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
    this.trackingNumber = `TRK-${Date.now().toString(36).toUpperCase()}`;
    // Seed initial status history
    this.statusHistory = [{ status: 'pending', timestamp: new Date(), note: 'Order placed' }];
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
