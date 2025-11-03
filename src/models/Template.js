import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  previewImage: String, 
  demo: { type: Object, default: {} } 
}, { timestamps: true });

export default mongoose.model("Template", templateSchema);
