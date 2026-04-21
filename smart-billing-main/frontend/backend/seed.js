const mongoose = require('mongoose');
const Product = require('./model/product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartbilling';

const sampleProducts = [
  { code: '101', name: 'Milk', price: 30, stock: 100 },
  { code: '102', name: 'Bread', price: 40, stock: 100 },
  { code: '103', name: 'Rice', price: 60, stock: 50 },
  { code: '104', name: 'Oil', price: 120, stock: 30 },
  { code: '105', name: 'Sugar', price: 45, stock: 60 },
  { code: '106', name: 'Salt', price: 20, stock: 80 },
  { code: '107', name: 'Tea', price: 250, stock: 25 },
  { code: '108', name: 'Coffee', price: 300, stock: 20 }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('✓ Cleared existing products');

    // Insert sample products
    const created = await Product.insertMany(sampleProducts);
    console.log(`✓ Added ${created.length} sample products`);

    console.log('\nSample Products:');
    created.forEach(p => {
      console.log(`  ${p.code}: ${p.name} - ₹${p.price}`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Database seeded successfully!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
