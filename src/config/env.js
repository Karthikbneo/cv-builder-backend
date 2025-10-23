import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const required = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
};
const num = (v, d) => (v ? Number(v) : d);

const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: num(process.env.PORT, 4000),
  MONGODB_URI: required("MONGODB_URI"),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? "*",
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? "./uploads",
  // JWT
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES ?? "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES ?? "7d",
  // Stripe
  STRIPE_SECRET: required("STRIPE_SECRET"),
  STRIPE_WEBHOOK_SECRET: required("STRIPE_WEBHOOK_SECRET"),
  DOWNLOAD_PRICE_INR: num(process.env.DOWNLOAD_PRICE_INR, 9900),
  SHARE_PRICE_INR: num(process.env.SHARE_PRICE_INR, 4900),
  CURRENCY: process.env.CURRENCY ?? "inr"
};

export default env;
