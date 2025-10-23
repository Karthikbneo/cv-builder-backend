import bcrypt from "bcryptjs";
import createError from "http-errors";
import User from "../models/User.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password, contactNumber } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw createError(409, "Email already in use");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, contactNumber, passwordHash });
    const access = signAccessToken({ sub: String(user._id), role: user.role });
    const refresh = signRefreshToken({ sub: String(user._id) });
    res.status(201).json({ user: { id: String(user._id), username, email }, access, refresh });
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw createError(401, "Invalid credentials");
    const ok = await user.comparePassword(password);
    if (!ok) throw createError(401, "Invalid credentials");
    const access = signAccessToken({ sub: String(user._id), role: user.role });
    const refresh = signRefreshToken({ sub: String(user._id) });
    res.json({ user: { id: String(user._id), username: user.username, email }, access, refresh });
  } catch (e) { next(e); }
};

export const refresh = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw createError(400, "Missing token");
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.sub);
    if (!user) throw createError(401, "Invalid token");
    const access = signAccessToken({ sub: String(user._id), role: user.role });
    res.json({ access });
  } catch (e) { next(e); }
};
