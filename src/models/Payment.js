import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  cv: { type: mongoose.Schema.Types.ObjectId, ref: "CV", index: true },
  action: { type: String, enum: ["download", "share"], required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "inr" },
  provider: { type: String, default: "stripe" },
  providerPaymentIntentId: { type: String, index: true },
  status: { type: String, enum: ["requires_payment", "succeeded", "failed"], default: "requires_payment", index: true }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
