import mongoose from "mongoose";
import env from "./env.js";

mongoose.set("strictQuery", true);
const connect = async () => {
  try {
    console.log("Connecting to MongoDB…");
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err?.message);
    process.exit(1);
  }
};
await connect();
export default mongoose;
