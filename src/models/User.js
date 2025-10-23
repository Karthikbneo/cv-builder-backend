import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  contactNumber: { type: String },
  passwordHash: { type: String },
  provider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
  providerId: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

userSchema.methods.comparePassword = async function(plain) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model("User", userSchema);
