import express from "express";

import { isAdmin } from "../middlewares/auth.js";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupon,
  verifyPayment,
} from "../controllers/payment.js";

const router = express.Router();

router.post("/create", createPaymentIntent as any);
router.get("/key", (_, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
})

router.post("/verify", verifyPayment as any);
router.post("/coupon/new", isAdmin as any, newCoupon as any);

router.get("/discount", applyDiscount as any);
router.get("/coupon/all", isAdmin as any, allCoupons as any);
router.delete("/coupon/:id", isAdmin as any, deleteCoupon as any);

export default router;
