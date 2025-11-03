// src/routes/auth.routes.js
import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
} from "../controllers/auth.controller.js";
import { registerRules, loginRules } from "../validators/auth.validation.js";
import { runValidation } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

// ---------- Local Auth ----------
r.post("/register", registerRules, runValidation, register);
r.post("/login", loginRules, runValidation, login);
r.post("/refresh", refresh);
r.get("/me", requireAuth, me);
r.post("/logout", logout);

// ---------- OAuth (Google / Facebook) ----------
r.get("/google", googleAuth);
r.get("/google/callback", googleCallback);

r.get("/facebook", facebookAuth);
r.get("/facebook/callback", facebookCallback);

export default r;
