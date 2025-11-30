# EasyBuy Backend

Backend API for EasyBuy e-commerce platform built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication with Firebase
- Product management (CRUD operations)
- Order processing with Razorpay payment integration
- Admin dashboard with statistics
- Coupon management
- Image upload with Multer

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Payment:** Razorpay
- **File Upload:** Multer
- **Caching:** Node-Cache

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
PORT=4000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_KEY=your_stripe_key
```

## Scripts

```bash
# Build TypeScript
npm run build

# Watch mode (auto-compile on changes)
npm run watch

# Start development server
npm run dev

# Start production server
npm start
```

## API Endpoints

- `/api/v1/user` - User management
- `/api/v1/product` - Product operations
- `/api/v1/order` - Order processing
- `/api/v1/payment` - Payment integration
- `/api/v1/dashboard` - Admin statistics

## Project Structure

```
src/
├── controllers/     # Route controllers
├── middlewares/     # Custom middlewares
├── models/          # Mongoose models
├── routes/          # API routes
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Author

codingraft
