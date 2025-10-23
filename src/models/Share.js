import mongoose from "mongoose";

const shareSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  cv: { type: mongoose.Schema.Types.ObjectId, ref: "CV", index: true },
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

shareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.model("Share", shareSchema);
