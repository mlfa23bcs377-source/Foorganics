require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Supplier.deleteMany({}),
    Product.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Admin user
  await User.create({ email: 'labadmin@foorganics.pk', password: 'Admin@123' });
  console.log('Created admin: labadmin@foorganics.pk / Admin@123');

  // Suppliers
  const [supplier1, supplier2] = await Supplier.create([
    { name: 'Organic Farms Ltd', contact_person: 'Ali Hassan', phone: '+92-300-1234567', email: 'ali@organicfarms.pk' },
    { name: 'Green Valley Suppliers', contact_person: 'Sara Ahmed', phone: '+92-321-9876543', email: 'sara@greenvalley.pk' },
  ]);
  console.log('Created 2 suppliers');

  // Products
  await Product.create([
    {
      supplier_id: supplier1._id,
      name: 'Organic Tomato Sauce',
      category: 'Sauces',
      description: 'Rich, homemade-style tomato sauce made from sun-ripened organic tomatoes. No preservatives, no artificial flavors.',
      cost_price: 1800,
      selling_price: 2500,
      stock_quantity: 50,
      image_url: '',
      is_listed: true,
    },
    {
      supplier_id: supplier1._id,
      name: 'Organic Pesto Sauce',
      category: 'Sauces',
      description: 'Classic basil pesto made with organic basil, pine nuts, and extra virgin olive oil.',
      cost_price: 2600,
      selling_price: 3600,
      stock_quantity: 30,
      image_url: '',
      is_listed: true,
    },
    {
      supplier_id: supplier2._id,
      name: 'Organic Honey',
      category: 'Sweeteners',
      description: 'Raw, unfiltered honey from organic beehives. Rich in antioxidants and natural enzymes.',
      cost_price: 3200,
      selling_price: 4400,
      stock_quantity: 40,
      image_url: '',
      is_listed: true,
    },
    {
      supplier_id: supplier1._id,
      name: 'Organic Olive Oil',
      category: 'Oils',
      description: 'Cold-pressed extra virgin olive oil from certified organic olives.',
      cost_price: 4600,
      selling_price: 6400,
      stock_quantity: 25,
      image_url: '',
      is_listed: true,
    },
    {
      supplier_id: supplier2._id,
      name: 'Organic Coconut Oil',
      category: 'Oils',
      description: 'Virgin coconut oil extracted from fresh organic coconuts without heat processing.',
      cost_price: 3800,
      selling_price: 5300,
      stock_quantity: 35,
      image_url: '',
      is_listed: true,
    },
    {
      supplier_id: supplier2._id,
      name: 'Organic Maple Syrup',
      category: 'Sweeteners',
      description: 'Pure Grade A maple syrup tapped from certified organic maple trees.',
      cost_price: 4000,
      selling_price: 5500,
      stock_quantity: 20,
      image_url: '',
      is_listed: true,
    },
  ]);
  console.log('Created 6 products');

  console.log('\nSeed complete!');
  console.log('Admin login: labadmin@foorganics.pk / Admin@123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
