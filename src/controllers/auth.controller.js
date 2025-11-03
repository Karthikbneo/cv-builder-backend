import bcrypt from "bcryptjs";
import createError from "http-errors";
import passport from "../config/passport.js";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const FE =
  process.env.FRONTEND_URL ||
  process.env.FRONTEND_ORIGIN ||
  "http://localhost:5176";

// ✅ Shared cookie options
const cookieOptsShort = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const cookieOptsLong = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const userPayload = (user) => ({
  id: String(user._id),
  username: user.username,
  email: user.email,
  role: user.role,
  provider: user.provider,
});


export const register = async (req, res, next) => {
  try {
    let { username, email, password, contactNumber } = req.body;
    if (!username || !email || !password)
      throw createError(400, "Username, email, and password are required");

    email = String(email).trim().toLowerCase();
    if (password.length < 6)
      throw createError(400, "Password must be at least 6 characters");

    const exists = await User.findOne({ email }).lean();
    if (exists) throw createError(409, "Email already in use");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username: username.trim(),
      email,
      contactNumber: contactNumber?.trim(),
      passwordHash,
      provider: "local",
      lastLogin: new Date(),
    });

    const access = signAccessToken({ sub: String(user._id), role: user.role });
    const refresh = signRefreshToken({ sub: String(user._id) });

    
    res
      .cookie("access_token", access, cookieOptsShort)
      .cookie("refresh_token", refresh, cookieOptsLong)
      .status(201)
      .json({
        user: userPayload(user),
        message: "Registration successful",
      });
  } catch (e) {
    next(e);
  }
};


export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      throw createError(400, "Email and password are required");

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) throw createError(401, "Invalid credentials");

    const ok = await user.comparePassword(password);
    if (!ok) throw createError(401, "Invalid credentials");

    // update login timestamp
    User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } }).catch(() => {});

    const access = signAccessToken({ sub: String(user._id), role: user.role });
    const refresh = signRefreshToken({ sub: String(user._id) });

    
    res
      .cookie("access_token", access, cookieOptsShort)
      .cookie("refresh_token", refresh, cookieOptsLong)
      .json({
        user: userPayload(user),
        message: "Login successful",
      });
  } catch (e) {
    next(e);
  }
};


export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw createError(401, "Missing refresh token");

    const decoded = verifyRefreshToken(token);
    if (!decoded?.sub) throw createError(401, "Invalid refresh token");

    const user = await User.findById(decoded.sub).lean();
    if (!user) throw createError(401, "User not found");

    const access = signAccessToken({ sub: String(user._id), role: user.role });
    res.cookie("access_token", access, cookieOptsShort).json({ ok: true });
  } catch (e) {
    next(createError(401, "Token refresh failed"));
  }
};


export const logout = async (_req, res, next) => {
  try {
    res
      .clearCookie("access_token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
      .clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
      .json({ message: "Logged out successfully" });
  } catch (e) {
    next(e);
  }
};


export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) throw createError(404, "User not found");
    res.json({ user: userPayload(user) });
  } catch (e) {
    next(e);
  }
};


export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

export const googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user) => {
    if (err || !user) return res.redirect(`${FE}/login?error=OAuthFailed`);
    User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } }).catch(() => {});

    const access = signAccessToken({ sub: String(user._id), role: user.role });
    const refresh = signRefreshToken({ sub: String(user._id) });

    // ✅ Set cookies, then redirect cleanly
    res
      .cookie("access_token", access, cookieOptsShort)
      .cookie("refresh_token", refresh, cookieOptsLong)
      .redirect(`${FE}/oauth-success?access=${access}&refresh=${refresh}`);
  })(req, res, next);
};




export const facebookAuth = passport.authenticate("facebook", {
  scope: ["email"],
  session: false,
});


export const facebookCallback = (req, res, next) => {
  passport.authenticate("facebook", { session: false }, async (err, user) => {
    if (err || !user) return res.redirect(`${FE}/login?error=OAuthFailed`);
    User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } }).catch(() => {});

    const access = signAccessToken({ sub: String(user._id), role: user.role });
    const refresh = signRefreshToken({ sub: String(user._id) });

    res
      .cookie("access_token", access, cookieOptsShort)
      .cookie("refresh_token", refresh, cookieOptsLong)
       .redirect(`${FE}/oauth-success?access=${access}&refresh=${refresh}`);
  })(req, res, next);
};
