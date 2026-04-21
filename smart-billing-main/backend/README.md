# Smart Billing Backend

Backend API server for the Smart Billing POS System.

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure .env with your settings
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Products
```
GET /api/products              # Get all products
GET /api/product/:code         # Get product by code
GET /api/categories            # Get all categories
GET /api/products/category/:name  # Get products by category
POST /api/search               # Search products
```

### Transactions
```
POST /api/checkout             # Process checkout
POST /api/send-receipt         # Send receipt via email
```

## Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example           # Environment template
├── config/               # Configuration files
├── routes/               # API route handlers
├── models/               # Data models
├── controllers/          # Business logic
└── middleware/           # Express middleware
```

## Development

### Adding Routes

Create route files in `/routes`:

```javascript
// routes/products.js
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  // Get products
});

export default router;
```

### Adding Models

Create model files in `/models`:

```javascript
// models/Product.js
export class Product {
  constructor(code, name, price) {
    this.code = code;
    this.name = name;
    this.price = price;
  }
}
```

### Adding Controllers

Create controller files in `/controllers`:

```javascript
// controllers/productController.js
export const getProducts = (req, res) => {
  // Implementation
};
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
PORT=5000              # Server port
NODE_ENV=development   # Environment
SMTP_HOST=...         # Email configuration
```

## Testing

Run API tests:
```bash
npm test
```

## Deployment

### Production Checklist

- [ ] Configure environment variables
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS
- [ ] Set up database
- [ ] Configure email service
- [ ] Enable CORS properly
- [ ] Add rate limiting
- [ ] Add authentication/authorization
- [ ] Set up error logging
- [ ] Configure backups

### Deployment Options

- Heroku
- AWS Lambda
- DigitalOcean
- Vercel
- Railway

## Troubleshooting

**Port already in use:**
```bash
# Change port in .env
PORT=3000
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**CORS errors:**
- Check CORS_ORIGIN in .env
- Ensure frontend URL is whitelisted

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## Support

For issues or questions, please open an issue on GitHub.
