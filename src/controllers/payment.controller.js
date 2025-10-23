import createError from "http-errors";
import env from "../config/env.js";
import Stripe from "stripe";
import Payment from "../models/Payment.js";
import CV from "../models/CV.js"; // for description fallback using CV title/name

const stripe = new Stripe(env.STRIPE_SECRET, { apiVersion: "2024-06-20" });

const priceFor = (action) => {
  if (action === "download") return env.DOWNLOAD_PRICE_INR; // e.g. 9900 for ₹99.00
  if (action === "share") return env.SHARE_PRICE_INR;       // e.g. 4900 for ₹49.00
  throw new Error("Unsupported action");
};

const buildDescription = async ({ cvId, action, userEmail, provided }) => {
  // 1) use client-provided description if present
  if (provided && String(provided).trim()) return String(provided).trim();

  // 2) use CV profile name (human-readable)
  try {
    const cv = await CV.findById(cvId).lean();
    if (cv?.profile?.name) {
      return `CV ${action} for "${cv.profile.name}"`;
    }
  } catch (_) {
    // ignore
  }

  // 3) safe fallback for Indian exports compliance
  return `CV ${action} • CV#${cvId}${userEmail ? ` • ${userEmail}` : ""}`;
};

/**
 * POST /api/v1/payments/intent
 * body: { cvId, action: 'download'|'share', description?, billing? }
 * billing?: {
 *   name, email, address: { line1, city, state, postal_code, country }
 * }
 */
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { cvId, action, description, billing } = req.body;
    if (!cvId) throw createError(400, "cvId is required");
    if (!action) throw createError(400, "action is required");

    const amount = priceFor(action);
    const desc = await buildDescription({
      cvId,
      action,
      userEmail: req.user?.email,
      provided: description,
    });

    // Optional: create a Stripe Customer from provided billing (good for receipts & reuse)
    let customerId;
    if (billing?.email || req.user?.email) {
      const customer = await stripe.customers.create({
        name: billing?.name || req.user?.username,
        email: billing?.email || req.user?.email,
        address: billing?.address, // { line1, city, state, postal_code, country }
        metadata: {
          app: "cv-builder",
          userId: req.user?.id || "",
        },
      });
      customerId = customer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: env.CURRENCY || "inr",
      // Required for India exports: non-empty description
      description: desc,
      automatic_payment_methods: { enabled: true },
      // Attach customer if we created one (optional but useful)
      customer: customerId,
      // App-level metadata
      metadata: {
        app: "cv-builder",
        userId: req.user.id,
        cvId,
        action,
      },
      // Email for Stripe receipt (if not set via customer)
      receipt_email: (billing?.email || req.user?.email) || undefined,
    });

    const payment = await Payment.create({
      user: req.user.id,
      cv: cvId,
      action,
      amount,
      currency: env.CURRENCY || "inr",
      providerPaymentIntentId: paymentIntent.id,
      status: "requires_payment",
      // Optional fields if your schema allows:
      // providerCustomerId: customerId,
      // description: desc,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (e) {
    next(e);
  }
};

// src/controllers/payment.controller.js
export const verifyAndSyncPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ message: "paymentId is required" });

    const payment = await Payment.findOne({ _id: paymentId, user: req.user.id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const pi = await stripe.paymentIntents.retrieve(payment.providerPaymentIntentId);

    if (pi.status === "succeeded" && payment.status !== "succeeded") {
      payment.status = "succeeded";
      await payment.save();
    } else if (["requires_payment_method", "canceled"].includes(pi.status)) {
      payment.status = "failed";
      await payment.save();
    }

    res.json({ status: payment.status });
  } catch (e) { next(e); }
};


// Stripe Webhook to mark payments succeeded/failed
export const webhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      // IMPORTANT: this route must use express.raw({ type: 'application/json' })
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object; // PaymentIntent
      await Payment.findOneAndUpdate(
        { providerPaymentIntentId: pi.id },
        {
          status: "succeeded",
          // optional enrichment if your schema supports:
          // description: pi.description,
          // providerCustomerId: pi.customer || undefined,
          // paymentMethodTypes: pi.payment_method_types,
        }
      );
    } else if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object;
      await Payment.findOneAndUpdate(
        { providerPaymentIntentId: pi.id },
        { status: "failed" }
      );
    }

    res.json({ received: true });
  } catch (e) {
    next(e);
  }
};
