import Razorpay from "razorpay";
// import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.model.js";
import ErrorHandler from "../utils/utility-class.js";
import crypto from "crypto";

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) {
    return next(new ErrorHandler("Please enter amount", 400));
  }

  console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID?.trim() || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET?.trim() || "",
  });

  const options = {
    amount: Number(amount) * 100,
    currency: "INR",
  };

  try {
    const order = await razorpay.orders.create(options);
    return res
    .status(201)
    .json({ success: true, order });
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return next(new ErrorHandler(error.message || "Failed to create order", 400));
  }

}); 
export const verifyPayment = TryCatch(async (req, res, next) => {
 console.log("req.body",req.body);
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "");
  hmac.update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === req.body.razorpay_signature) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }

});
export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;

  if (!coupon || !amount) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  await Coupon.create({ coupon, amount });

  return res
    .status(201)
    .json({ success: true, message: `Coupon ${coupon} created successfully` });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ coupon });

  if (!discount) {
    return next(new ErrorHandler("Coupon not found", 404));
  }

  return res.status(200).json({ success: true, discount: discount.amount });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});
  if (!coupons) {
    return next(new ErrorHandler("Coupons not found", 404));
  }
  return res.status(200).json({ success: true, coupons });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    return next(new ErrorHandler("Invalid ID", 400));
  }

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.coupon} deleted successfully`,
  });
});
