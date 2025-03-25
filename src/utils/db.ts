import mongoose, { Document } from "mongoose";
import { InvalidCacheProps, OrderItemType } from "../types/type.js";
import { Product } from "../models/products.model.js";
import { cache } from "../app.js";
import { Order } from "../models/order.model.js";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

export const invalidateCache = ({
  product,
  admin,
  order,
  userId,
  orderId,
  productId,
}: InvalidCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latestProducts",
      "categories",
      "allProducts",
    ];

    if (typeof productId === "string") {
      productKeys.push(`product-${productId}`);
    }
    if (typeof productId === "object") {
      productId.forEach((id) => {
        productKeys.push(`product-${id}`);
      });
    }  

    cache.del(productKeys);
  }
  if (order) {
    const orderKeys: string[] = [
      "allOrders",
      `myOrders-${userId}`,
      `singleOrder-${orderId}`,
    ];
    // const orders = await Order.find({}).select("_id");

    cache.del(orderKeys);
  }
  if (admin) {
    cache.del(["stats", "pie-charts", "bar-charts", "line-charts"]);
  }
};

export const reduceOrderQuantity = async (orderItems: OrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) {
      throw new Error("Product out of stock");
    }
    product.stock -= order.quantity;
    await product.save();
  }
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  return Math.floor((thisMonth / lastMonth) * 100);
};

export const getInventories = async ({
  categories,
  productsCount,
}: {
  categories: string[];
  productsCount: number;
}) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, index) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[index] / productsCount) * 100),
    });
  });

  return categoryCount;
};

interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}
type FuncProps = {
  length: number;
  docArr: MyDocument[];
  today: Date;
  property?: "discount" | "total";
};

export const getChartData = ({
  length,
  docArr,
  today,
  property,
}: FuncProps) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12; // difference in months

    if (monthDiff < length) {
      const monthIndex = length - monthDiff - 1;
      data[monthIndex] += property ? i[property]! : 1;
    }
  });

  return data;
};
