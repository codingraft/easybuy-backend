import { User } from "../models/user.model.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";

export const isAdmin = TryCatch(async (req, res, next) => {
  const { id } = req.query;

  if (!id) return next(new ErrorHandler("Login required", 401));

  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.role !== "admin")
    return next(new ErrorHandler("Admin access denied", 403));

  next();
});
