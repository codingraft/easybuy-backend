import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/type.js";
import ErrorHandler from "../utils/utility-class.js";
import { Product } from "../models/products.model.js";
import { rm } from "fs";
import { cache } from "../app.js";
import { invalidateCache } from "../utils/db.js";
// import { faker } from '@faker-js/faker'

export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products;

  if (cache.has("latestProducts")) {
    products = JSON.parse(cache.get("latestProducts") as string);
  } else {
    products = await Product.find().sort({ createdAt: -1 }).limit(5);
    cache.set("latestProducts", JSON.stringify(products));
  }
  if (!products) {
    return next(new ErrorHandler("Products not found", 404));
  }
  return res.status(200).json({
    success: true,
    products,
  });
});

export const getAllProductsCategory = TryCatch(async (req, res, next) => {
  let categories;

  if (cache.has("categories")) {
    categories = JSON.parse(cache.get("categories") as string);
  } else {
    categories = await Product.find().distinct("category");
    cache.set("categories", JSON.stringify(categories));
  }

  if (!categories) {
    return next(new ErrorHandler("Products not found", 404));
  }
  return res.status(200).json({
    success: true,
    categories,
  });
});

export const getAdminsProducts = TryCatch(async (req, res, next) => {
  let products;
  if (cache.has("allProducts")) {
    products = JSON.parse(cache.get("allProducts") as string);
  } else {
    products = await Product.find({});
    cache.set("allProducts", JSON.stringify(products));
  }

  if (!products) {
    return next(new ErrorHandler("Products not found", 404));
  }
  return res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  if (cache.has(`product-${id}`)) {
    product = JSON.parse(cache.get(`product-${id}`) as string);
  } else {
    product = await Product.findById(id);
    cache.set(`product-${id}`, JSON.stringify(product));
  }

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  return res.status(200).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const image = req.file;

    if (!image) {
      return next(new ErrorHandler("Please upload an image", 400));
    }
    if (!name || !price || !stock || !category) {
      rm(image.path, () => {
        console.log("Image deleted");
      });
      return next(new ErrorHandler("Please fill all the fields", 400));
    }

    const product = await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      image: image.path,
    });

    if (!product) {
      return next(new ErrorHandler("Product not created", 400));
    }

    invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const image = req.file;

  if (!id) return next(new ErrorHandler("Please provide product id", 400));
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  if (image) {
    rm(product.image, () => {
      console.log("Image deleted");
    });
    product.image = image.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

  invalidateCache({
    product: true,
    productId: product._id.toString(),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  rm(product.image, () => {
    console.log("Image deleted");
  });

  await product.deleteOne();

  invalidateCache({
    product: true,
    productId: product._id.toString(),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCTS_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};
    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i", // case insensitive
      };
    }
    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }
    if (category) {
      baseQuery.category = category;
    }

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredAllProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPages = Math.ceil(filteredAllProducts.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPages,
    });
  }
);

// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       image: "uploads\\47f47bf3-9872-453a-a676-1c905326b23e.jpeg",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }

//   await Product.create(products);

//   console.log({ succecss: true });
// };

// generateRandomProducts(40);

// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };

// deleteRandomsProducts(38);
