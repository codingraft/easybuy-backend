import express from "express";
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/order.js";
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/new", newOrder as any);
router.get("/my", myOrders as any);
router.get("/all", isAdmin as any, allOrders as any);
router
  .route("/:id")
  .get(getSingleOrder as any)
  .put(isAdmin as any, processOrder as any)
  .delete(isAdmin as any, deleteOrder as any);

export default router;
