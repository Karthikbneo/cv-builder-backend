import mongoose from "mongoose";

const monthStr = { type: String, trim: true, match: [/^\d{4}-\d{2}$/, 'Use YYYY-MM'] };

const profileSchema = new mongoose.Schema({
  imageUrl: { type: String, trim: true },
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  summary: { type: String, trim: true },
}, { _id: false });

const educationSchema = new mongoose.Schema({
  degree: { type: String, trim: true },
  institution: { type: String, trim: true },
  percentage: { type: Number, min: 0, max: 100 },
  start: monthStr, // "YYYY-MM"
  end: monthStr, // "YYYY-MM" or empty
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  organization:{ type: String, trim: true },
  location: { type: String, trim: true },
  position: { type: String, trim: true },
  ctc: { type: Number, min: 0 },
  start: monthStr,
  end: monthStr,
  technologies:[{ type: String, trim: true }],
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  teamSize: { type: Number, min: 1 },
  duration: { type: String, trim: true }, // e.g. "3 months"
  technologies: [{ type: String, trim: true }],
  description: { type: String, trim: true },
}, { _id: false });

const skillSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  level: { type: Number, min: 0, max: 100, default: 50 },
}, { _id: false });

const socialSchema = new mongoose.Schema({
  platform: { type: String, trim: true },
  url: { type: String, trim: true },
}, { _id: false });

const cvSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  template: { type: String, default: "classic", trim: true },

  profile: profileSchema,
  education: [educationSchema],
  experience: [experienceSchema],
  projects: [projectSchema],
  skills: [skillSchema],
  socials: [socialSchema],

  theme: {
    font: { type: String, default: "Inter", trim: true },
    size: { type: String, default: "12px", trim: true },
    colors: {
      primary: { type: String, default: "#111827", trim: true },
      accent: { type: String, default: "#2563eb", trim: true },
    },
  },

  shareUrl: { type: String, default: null, trim: true },
  shareExpiresAt: { type: Date, default: null },
}, { timestamps: true });

// Ensure clean JSON (no __v)
cvSchema.set("toJSON", {
  versionKey: false,
  transform: (_, ret) => ret,
});

export default mongoose.model("CV", cvSchema);