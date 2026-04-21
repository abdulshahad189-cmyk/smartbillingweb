/**
 * Smart Billing POS Backend Server
 * Express API for product management, checkout, and receipt delivery
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// PRODUCTS DATA (Mock Database)
// ============================================

const PRODUCTS = [
  { code: '101', name: 'Milk', price: 30, category: 'Dairy', image: null },
  { code: '102', name: 'Bread', price: 40, category: 'Bakery', image: null },
  { code: '103', name: 'Rice', price: 60, category: 'Grocery', image: null },
  { code: '104', name: 'Oil', price: 120, category: 'Grocery', image: null },
  { code: '105', name: 'Sugar', price: 45, category: 'Grocery', image: null },
  { code: '106', name: 'Salt', price: 20, category: 'Grocery', image: null },
  { code: '107', name: 'Tea', price: 250, category: 'Beverages', image: null },
  { code: '108', name: 'Coffee', price: 300, category: 'Beverages', image: null },
  { code: '109', name: 'Butter', price: 150, category: 'Dairy', image: null },
  { code: '110', name: 'Eggs', price: 35, category: 'Dairy', image: null }
];

// ============================================
// ROUTES - Health Check
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// ============================================
// ROUTES - API
// ============================================

const apiRoutes = express.Router();

/**
 * GET /api/products
 * Get all products
 */
apiRoutes.get('/products', (req, res) => {
  try {
    res.json(PRODUCTS);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/product/:code
 * Get product by code
 */
apiRoutes.get('/product/:code', (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const product = PRODUCTS.find(p => p.code === code);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * GET /api/products/category/:category
 * Get products by category
 */
apiRoutes.get('/products/category/:category', (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const products = PRODUCTS.filter(p =>
      p.category.toLowerCase() === category
    );

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * POST /api/checkout
 * Process checkout and calculate final bill
 */
apiRoutes.post('/checkout', (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid cart items' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    const transactionId = `TXN-${Date.now()}`;

    res.json({
      success: true,
      transactionId: transactionId,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      timestamp: new Date().toISOString(),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ error: 'Failed to process checkout' });
  }
});

/**
 * POST /api/send-receipt
 * Send receipt via email
 */
apiRoutes.post('/send-receipt', (req, res) => {
  try {
    const { email, fileName, pdfBase64, sale } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!pdfBase64 || !fileName) {
      return res.status(400).json({ error: 'Missing PDF data' });
    }

    // TODO: Implement email sending using Nodemailer
    // For now, just acknowledge receipt

    const receiptId = `RCP-${Date.now()}`;

    res.json({
      success: true,
      receiptId: receiptId,
      email: email,
      message: 'Receipt request received. Email functionality coming soon.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending receipt:', error);
    res.status(500).json({ error: 'Failed to send receipt' });
  }
});

/**
 * GET /api/categories
 * Get all product categories
 */
apiRoutes.get('/categories', (req, res) => {
  try {
    const categories = [...new Set(PRODUCTS.map(p => p.category))];
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * POST /api/search
 * Search products
 */
apiRoutes.post('/search', (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid search query' });
    }

    const searchTerm = query.toLowerCase();
    const results = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.code.includes(searchTerm)
    );

    res.json({ results, count: results.length });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Register API routes
app.use('/api', apiRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Exception:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER START
// ============================================

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     Smart Billing Backend Server Started   ║
╚════════════════════════════════════════════╝

📍 Server: http://localhost:${PORT}
🌐 API:    http://localhost:${PORT}/api
💚 Health: http://localhost:${PORT}/health
🔧 Mode:   ${NODE_ENV}
⏰ Time:   ${new Date().toISOString()}

Available endpoints:
  GET  /api/products
  GET  /api/product/:code
  GET  /api/categories
  POST /api/search
  POST /api/checkout
  POST /api/send-receipt

Press Ctrl+C to stop the server.
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
