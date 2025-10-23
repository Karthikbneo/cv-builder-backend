import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import hpp from "hpp";
import xss from "xss-clean";
import path from "node:path";
import fs from "node:fs";
import env from "./config/env.js";
import router from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.js";

// 🔔 Import the webhook handler directly
import { webhook as stripeWebhook } from "./controllers/payment.controller.js";

const app = express();
app.set("trust proxy", true);

// ---------- Security / infra ----------
app.use(helmet());
app.use(hpp());
app.use(xss());
if (env.NODE_ENV !== "test") app.use(morgan("dev"));

// ---------- CORS (allowlist & credentials-safe) ----------
const allowlist = (env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// With credentials=true, Access-Control-Allow-Origin cannot be '*'
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // non-browser tools / curl
      if (allowlist.length === 0) return cb(null, true); // dev fallback: allow all
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------- Static uploads ----------
if (!fs.existsSync(env.UPLOAD_DIR)) fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

// ---------- Health ----------
app.get("/health", (req, res) => res.json({ ok: true }));

// ---------- Stripe webhook (MUST use raw, BEFORE express.json) ----------
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);



// ---------- Body parsers (AFTER webhook) ----------
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------- Main API router ----------
app.use("/api/v1", router);

// ---------- Errors ----------
app.use(notFound);
app.use(errorHandler);

export default app;
