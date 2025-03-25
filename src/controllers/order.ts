import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from "../types/type.js";
import { Order } from "../models/order.model.js";
import { invalidateCache, reduceOrderQuantity } from "../utils/db.js";
import ErrorHandler from "../utils/utility-class.js";
import { cache } from "../app.js";

export const myOrders = TryCatch(async (req, res, next) => {
  const { id: user } = req.query;

  const key = `myOrders-${user}`;

  let orders = [];
  if (cache.get(key)) {
    orders = JSON.parse(cache.get(key) as string);
  } else {
    orders = await Order.find({ user });
    cache.set(key, JSON.stringify(orders));
  }

  res.status(200).json({ success: true, orders });
});

export const allOrders = TryCatch(async (req, res, next) => {
  const key = `allOrders`;

  let orders = [];
  if (cache.get(key)) {
    orders = JSON.parse(cache.get(key) as string);
  } else {
    orders = await Order.find().populate("user", "name");
    cache.set(key, JSON.stringify(orders));
  }
  invalidateCache({
    product: true,
    order: true,
    admin: true,
  });

  res.status(200).json({ success: true, orders });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const key = `singleOrder-${id}`;

  let order;

  if (cache.get(key)) {
    order = JSON.parse(cache.get(key) as string);
  } else {
    order = await Order.findById(id).populate("user", "name");

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    cache.set(key, JSON.stringify(order));
  }

  res.status(200).json({ success: true, order });
});

export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      orderItems,
      tax,
      subtotal,
      user,
      shippingCharges,
      discount,
      total,
    } = req.body;

    await Order.create({
      shippingInfo,
      orderItems,
      tax,
      subtotal,
      user,
      shippingCharges,
      discount,
      total,
    });

    if (!shippingInfo || !orderItems || !tax || !subtotal || !user || !total) {
      return next(new ErrorHandler("Please fill all fields", 400));
    }

    await reduceOrderQuantity(orderItems);
    invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: orderItems.map((item) => item.productId.toString()),
    });

    res
      .status(201)
      .json({ success: true, message: "Order placed successfully" });
  }
);

export const processOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;

    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: order._id.toString(),
  });

  res
    .status(201)
    .json({ success: true, message: "Order processed successfully" });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  await order.deleteOne();

  invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: order._id.toString(),
  });

  res
    .status(201)
    .json({ success: true, message: "Order deleted successfully" });
});
