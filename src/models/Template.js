import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  previewImage: String, // optional URL (could be frontend static or generated)
  demo: { type: Object, default: {} } // sample CV data for preview
}, { timestamps: true });

export default mongoose.model("Template", templateSchema);
