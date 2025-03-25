import express from "express";

import { isAdmin } from "../middlewares/auth.js";
import {
  getBarCharts,
  getDashboardStats,
  getLineCharts,
  getPieChart,
} from "../controllers/stats.js";

const router = express.Router();

router.get("/stats", isAdmin as any, getDashboardStats as any); // route - /api/v1/user/new

router.get("/pie", isAdmin as any, getPieChart as any);
router.get("/bar", isAdmin as any, getBarCharts as any);
router.get("/line", isAdmin as any, getLineCharts as any);

export default router;
