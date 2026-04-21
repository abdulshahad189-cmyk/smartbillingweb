const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Product = require('./model/product');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('../'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartbilling';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.log('✗ MongoDB connection failed:', err.message));

// Routes
app.get('/api/product/:code', async (req, res) => {
  try {
    const product = await Product.findOne({ code: req.params.code.toUpperCase() });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().limit(50);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { code, name, price } = req.body;
    if (!code || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existingProduct = await Product.findOne({ code: code.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product code already exists' });
    }
    
    const product = new Product({ code: code.toUpperCase(), name, price });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    let total = 0;
    for (let item of items) {
      total += item.price * item.quantity;
    }
    
    res.json({ 
      success: true, 
      message: 'Checkout successful',
      total,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Send e-receipt via email. Accepts { email, fileName, pdfBase64, sale }
app.post('/api/send-receipt', async (req, res) => {
  try {
    const { email, fileName, pdfBase64, sale } = req.body;
    if (!email || !fileName || !pdfBase64) return res.status(400).json({ error: 'Missing fields' });

    // Prepare attachment
    const buffer = Buffer.from(pdfBase64, 'base64');

    // Configure transporter
    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: (process.env.SMTP_SECURE === 'true'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Fallback to Ethereal for local dev
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || 'no-reply@smartbill.local',
      to: email,
      subject: `Your e-receipt - ${fileName}`,
      text: `Thank you for your purchase. Attached is your receipt.`,
      attachments: [{ filename: fileName, content: buffer }]
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    res.json({ success: true, previewUrl });
  } catch (error) {
    console.error('send-receipt error', error);
    res.status(500).json({ error: 'Failed to send e-receipt' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
