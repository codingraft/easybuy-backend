import express from "express";
import {
  deleteUser,
  getAllUser,
  getUser,
  newUser,
} from "../controllers/user.js";
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/new", newUser as any); // route - /api/v1/user/new

router.get("/all",isAdmin as any, getAllUser as any); // route - /api/v1/user/all

router.route("/:id").get(getUser as any).delete(isAdmin as any,deleteUser as any); // route - /api/v1/user/dynamicID

export default router;
 