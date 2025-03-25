import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    coupon: {
      type: String,
      required: [true, "Coupon is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model("Coupon", couponSchema);
