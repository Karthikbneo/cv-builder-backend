// src/middlewares/auth.js
import createError from "http-errors";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";


function getAccessToken(req) {
  const cookieToken = req.cookies?.access_token || null;    
  const hdr = req.headers.authorization || "";
  const bearer = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  return cookieToken || bearer || null;
}

export const requireAuth = async (req, _res, next) => {
  try {
    const token = getAccessToken(req);
    if (!token) throw createError(401, "Unauthorized");

    const payload = verifyAccessToken(token); // { sub, role, ... }
    const user = await User.findById(payload.sub).select("_id role").lean();
    if (!user) throw createError(401, "Unauthorized");

    req.user = { id: String(user._id), role: user.role };
    next();
  } catch (e) {
    next(createError(401, "Unauthorized"));
  }
};


export const maybeAuth = async (req, _res, next) => {
  const token = getAccessToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("_id role").lean();
    if (user) req.user = { id: String(user._id), role: user.role };
  } catch (_) {

  }
  next();
};

export const requireRole = (roles = []) => (req, _res, next) => {
  if (!req.user) return next(createError(401, "Unauthorized"));
  if (roles.length && !roles.includes(req.user.role)) {
    return next(createError(403, "Forbidden"));
  }
  next();
};
