import createError from "http-errors";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    if (!token) throw createError(401, "Missing token");
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).lean();
    if (!user) throw createError(401, "Invalid token");
    req.user = { id: String(user._id), role: user.role };
    next();
  } catch (e) {
    next(createError(401, e.message));
  }
};
