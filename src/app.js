import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import hpp from "hpp";
import xss from "xss-clean";
import cookieParser from "cookie-parser";              // ✅ NEW
import path from "node:path";
import fs from "node:fs";
import env from "./config/env.js";
import router from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.js";
import { webhook as stripeWebhook } from "./controllers/payment.controller.js";

const app = express();
app.set("trust proxy", true);

// ---------- Security / hardening ----------
app.use(helmet());
app.use(hpp());
app.use(xss());
if (env.NODE_ENV !== "test") app.use(morgan("dev"));

// ---------- CORS (credentials for cookie auth) ----------
const allowlist = (env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients or when no Origin header
      if (!origin) return cb(null, true);
      // dev fallback: allow all if no allowlist provided
      if (allowlist.length === 0) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true, // ✅ allow cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------- Static uploads ----------
if (!fs.existsSync(env.UPLOAD_DIR)) fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

// ---------- Health ----------
app.get("/health", (_req, res) => res.json({ ok: true }));

// ---------- Stripe webhook (MUST use raw, BEFORE express.json) ----------
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ---------- Parsers (AFTER webhook) ----------
app.use(cookieParser());                                 // ✅ cookies available on req.cookies
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------- API ----------
app.use("/api/v1", router);

// ---------- Errors ----------
app.use(notFound);
app.use(errorHandler);

export default app;
