import express from "express";

import { isAdmin } from "../middlewares/auth.js";
import {
  deleteProduct,
  getAdminsProducts,
  getAllProducts,
  getAllProductsCategory,
  getLatestProducts,
  getSingleProduct,
  newProduct,
  updateProduct,
} from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAdmin as any, singleUpload, newProduct as any);
router.get("/all", getAllProducts as any);
router.get("/latest", getLatestProducts as any);
router.get("/categories", getAllProductsCategory as any);
router.get("/admin-products", getAdminsProducts as any);

router
  .route("/:id")
  .get(getSingleProduct as any)
  .put(isAdmin as any,singleUpload, updateProduct as any)
  .delete(isAdmin as any,deleteProduct as any);

export default router;
