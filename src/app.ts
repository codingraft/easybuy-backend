import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/products.route.js";
import orderRouter from "./routes/order.route.js";
import paymentRouter from "./routes/payment.route.js";
import dashboardRouter from "./routes/stats.route.js";
import { connectDB } from "./utils/db.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import morgan from "morgan";
import cors from 'cors'
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

dotenv.config({
  path: './.env'
});

const app = express();

// Security Middleware
app.use(helmet());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json());
const PORT = process.env.PORT || 4001;
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Restrict origin in production
  credentials: true
}))

export const cache = new NodeCache();

app.get("/", (_req, res) => {
  res.send("Api working");
});

// using routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// No need for static uploads folder - using Cloudinary



app.use(errorMiddleware as any);
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
