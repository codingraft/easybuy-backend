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
import Stripe from "stripe";
import cors from 'cors'

dotenv.config({
  path: './.env'
});

const stripeKey = process.env.STRIPE_KEY || "";

export const stripe = new Stripe(stripeKey)

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4001;
app.use(morgan('dev'));
app.use(cors())

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

app.use('/uploads', express.static('uploads'));


  
app.use(errorMiddleware as any);
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 