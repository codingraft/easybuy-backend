import { cache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/products.model.js";
import { User } from "../models/user.model.js";
import {
  calculatePercentage,
  getChartData,
  getInventories,
} from "../utils/db.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats;
  const key = "stats";

  if (cache.has(key)) {
    stats = JSON.parse(cache.get("stats") as string);
  } else {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    const enfOfThisMonth = today;

    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthUserPromise = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthUserPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthsOrdersPromise = Order.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });

    const latestTransactionPromise = Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProducts,
      lastMonthProducts,
      thisMonthUsers,
      lastMonthUsers,
      thisMonthOrders,
      lastMonthOrders,
      productsCount,
      usersCount,
      allOrders,
      lastSixMonthsOrders,
      categories,
      maleUsersCount,
      latestTransactions,
    ] = await Promise.all([
      thisMonthProductsPromise,
      lastMonthProductsPromise,
      thisMonthUserPromise,
      lastMonthUserPromise,
      thisMonthOrdersPromise,
      lastMonthOrdersPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthsOrdersPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "male" }),
      latestTransactionPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (acc, order) => acc + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (acc, order) => acc + (order.total || 0),
      0
    );

    const changePercent = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
    };

    const revenue = allOrders.reduce(
      (acc, order) => acc + (order.total || 0),
      0
    );

    const count = {
      revenue,
      product: productsCount,
      user: usersCount,

      order: allOrders.length,
    };

    const orderMonthCounts = getChartData({
      length: 6,
      docArr: lastSixMonthsOrders,
      today,
    })
    const orderMonthlyRevenue = getChartData({
      length: 6,
      docArr: lastSixMonthsOrders,
      today,
      property: "total",
    });

    // lastSixMonthsOrders.forEach((order) => {
    //   const creationDate = order.createdAt;
    //   const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12; // difference in months

    //   if (monthDiff < 6) {
    //     const monthIndex = 6 - monthDiff - 1;
    //     orderMonthCounts[monthIndex] += 1;
    //     orderMonthlyRevenue[monthIndex] += order.total;
    //   }
    // });

    const categoryCount = await getInventories({
      categories,
      productsCount,
    });

    const userGenderRatio = {
      male: maleUsersCount,
      female: usersCount - maleUsersCount,
    };

    const modifiedTransaction = latestTransactions.map((transaction) => ({
      _id: transaction._id,
      discount: transaction.discount,
      amount: transaction.total,
      quantity: transaction.orderItems.length,
      status: transaction.status,
    }));

    stats = {
      categoryCount,
      changePercent,
      count,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthlyRevenue,
      },
      userGenderRatio,
      latestTransactions: modifiedTransaction,
    };

    cache.set(key, JSON.stringify(stats));
  }

  return res.status(200).json({
    success: true,
    stats,
  });
});

export const getPieChart = TryCatch(async (req, res, next) => {
  let charts;
  const key = "pie-charts";

  if (cache.has(key)) {
    charts = JSON.parse(cache.get(key) as string);
  } else {
    const allOrdersPromise = Order.find({}).select([
      "total",
      "discount",
      "subtotal",
      "tax",
      "shippingCharges",
    ]);

    const [
      processing,
      shipped,
      delivered,
      categories,
      productsCount,
      productsOutOfStock,
      allOrders,
      allUsers,
      adminUsers,
      customerUsers,
    ] = await Promise.all([
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
      Product.distinct("category"),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      allOrdersPromise,
      User.find({}).select(["dob"]),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
    ]);

    const orderFullfillment = {
      processing,
      shipped,
      delivered,
    };

    const productCategories = await getInventories({
      categories,
      productsCount,
    });

    const stockAvailability = {
      inStock: productsCount - productsOutOfStock,
      outOfStock: productsOutOfStock,
    };

    const grossIncome = allOrders.reduce(
      (acc, order) => acc + (order.total || 0),
      0
    );

    const discount = allOrders.reduce(
      (acc, order) => acc + (order.discount || 0),
      0
    );

    const productionCost = allOrders.reduce(
      (acc, order) => acc + (order.shippingCharges || 0),
      0
    );

    const burnt = allOrders.reduce((acc, order) => acc + (order.tax || 0), 0);

    const marketingCost = Math.round(grossIncome * (20 / 100));

    const netMargin =
      grossIncome - discount - productionCost - burnt - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    const teen = allUsers.filter((user) => user.age < 20).length;
    const adult = allUsers.filter(
      (user) => user.age >= 20 && user.age < 40
    ).length;
    const senior = allUsers.filter((user) => user.age >= 40).length;

    const usersAgeGroup = {
      teen,
      adult,
      senior,
    };

    const adminCustomer = {
      admin: adminUsers,
      customer: customerUsers,
    };

    charts = {
      orderFullfillment,
      productCategories,
      stockAvailability,
      revenueDistribution,
      usersAgeGroup,
      adminCustomer, 
    };

    cache.set(key, JSON.stringify(charts));
  }

  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getBarCharts = TryCatch(async (req, res, next) => {
  let barCharts;
  const key = "bar-charts";

  if (cache.has(key)) {
    barCharts = JSON.parse(cache.get(key) as string);
  } else {
    const today = new Date();
    const sixMonthsAgo = new Date();
    const twelveMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const lastSixMonthsProductsPromise = Product.find({
      createdAt: { $gte: sixMonthsAgo, $lte: today },
    }).select("createdAt");
    const lastSixMonthsUsersPromise = User.find({
      createdAt: { $gte: sixMonthsAgo, $lte: today },
    }).select("createdAt");
    const lastTwelveMonthsOrdersPromise = Order.find({
      createdAt: { $gte: twelveMonthsAgo, $lte: today },
    }).select("createdAt");

    const [products, users, orders] = await Promise.all([
      lastSixMonthsUsersPromise,
      lastSixMonthsProductsPromise,
      lastTwelveMonthsOrdersPromise,
    ]);

    const productsCount = getChartData({ length: 6, docArr: products, today });
    const usersCount = getChartData({ length: 6, docArr: users, today });
    const ordersCount = getChartData({ length: 12, docArr: orders, today });

    barCharts = {
      users: productsCount,
      products: usersCount,
      orders: ordersCount,
    };

    cache.set(key, JSON.stringify(barCharts));
  }

  return res.status(200).json({
    success: true,
    barCharts,
  });
});

export const getLineCharts = TryCatch(async (req, res, next) => {
  let lineCharts;
  const key = "line-charts";

  if (cache.has(key)) {
    lineCharts = JSON.parse(cache.get(key) as string);
  } else {
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const baseQuery = {
      createdAt: { $gte: twelveMonthsAgo, $lte: today },
    };
 
    const [products, users, orders] = await Promise.all([
      Product.find(baseQuery).select("createdAt"),
      User.find(baseQuery).select("createdAt"),
      Order.find(baseQuery).select(["createdAt", "discount", "total"]),
    ]);

    const productsCount = getChartData({ length: 12, docArr: products, today });
    const usersCount = getChartData({ length: 12, docArr: users, today });
    const discount = getChartData({
      length: 12,
      docArr: orders,
      today,
      property: "discount",
    });
    const revenue = getChartData({
      length: 12,
      docArr: orders,
      today,
      property: "total",
    });

    lineCharts = {
      users: productsCount,
      products: usersCount,
      discount,
      revenue
    };

    cache.set(key, JSON.stringify(lineCharts));
  }

  return res.status(200).json({
    success: true,
    lineCharts,
  });
});
