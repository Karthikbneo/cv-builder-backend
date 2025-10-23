import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    imageUrl: String,
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    summary: String,
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: String,
    institution: String,
    percentage: Number,
    start: Date,
    end: Date,
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    organization: String,
    location: String,
    position: String,
    ctc: Number,
    start: Date,
    end: Date,
    technologies: [String],
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: String,
    teamSize: Number,
    duration: String,
    technologies: [String],
    description: String,
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    name: String,
    level: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const socialSchema = new mongoose.Schema(
  {
    platform: String,
    url: String,
  },
  { _id: false }
);

const cvSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    template: { type: String, default: "classic" },

    profile: profileSchema,
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    skills: [skillSchema],
    socials: [socialSchema],

    theme: {
      font: { type: String, default: "Inter" },
      size: { type: String, default: "12px" },
      colors: {
        primary: { type: String, default: "#111827" },
        accent: { type: String, default: "#2563eb" },
      },
    },

    // ✅ New: where the webhook writes the public link after a successful "share" payment
    shareUrl: { type: String, default: null },

    // (Optional) if you want shares to expire automatically later
    shareExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("CV", cvSchema);
