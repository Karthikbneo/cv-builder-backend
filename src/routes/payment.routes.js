import { Router } from "express";
import express from "express";
import { body } from "express-validator";
import { createPaymentIntent, webhook } from "../controllers/payment.controller.js";
import { verifyAndSyncPayment } from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { runValidation } from "../middlewares/validate.js";

const router = Router();


router.post(
  "/verify",
  requireAuth,
  body("paymentId").isMongoId(),
  runValidation,
  verifyAndSyncPayment
);


router.post(
  "/intent",
  requireAuth,
  body("cvId").isMongoId().withMessage("cvId is required"),
  body("action")
    .isIn(["download", "share"])
    .withMessage("action must be 'download' or 'share'"),
  body("description")
    .optional()
    .isString()
    .isLength({ min: 3, max: 500 })
    .withMessage("description must be 3–500 chars"),

  // billing (optional) validations
  body("billing").optional().isObject(),
  body("billing.name")
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage("billing.name must be at least 2 chars"),
  body("billing.email")
    .optional()
    .isEmail()
    .withMessage("billing.email must be a valid email"),
  body("billing.address").optional().isObject(),
  body("billing.address.line1")
    .optional()
    .isString()
    .withMessage("billing.address.line1 must be a string"),
  body("billing.address.city")
    .optional()
    .isString()
    .withMessage("billing.address.city must be a string"),
  body("billing.address.state")
    .optional()
    .isString()
    .withMessage("billing.address.state must be a string"),
  body("billing.address.postal_code")
    .optional()
    .isString()
    .withMessage("billing.address.postal_code must be a string"),
  body("billing.address.country")
    .optional()
    .isString()
    .isLength({ min: 2, max: 2 })
    .withMessage("billing.address.country must be a 2-letter ISO code"),

  runValidation,
  createPaymentIntent
);


router.post("/webhook", express.raw({ type: "application/json" }), webhook);

export default router;
