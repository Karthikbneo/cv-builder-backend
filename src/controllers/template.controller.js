import Template from "../models/Template.js";

const defaults = [
  {
    key: "classic",
    name: "Classic",
    description: "Clean single-column layout with strong headings.",
    previewImage: "",
    demo: {
      template: "classic",
      profile: { name: "Aarav Sharma", email: "aarav@example.com", phone: "+91 90000 00000", city: "Mumbai", summary: "Frontend engineer with a love for clean UI." },
      education: [{ degree: "B.Tech CSE", institution: "IIT Bombay", start: "2017-07-01", end: "2021-05-30" }],
      experience: [{ organization: "NeoSOFT", location: "Mumbai", position: "UI Developer", start: "2021-07-01", technologies: ["React","CSS","Node"] }],
      projects: [{ title: "CV Builder", description: "A responsive CV generator." }],
      skills: [{ name: "React", level: 85 }, { name: "CSS", level: 80 }]
    }
  },
  {
    key: "modern",
    name: "Modern",
    description: "Two-tone accents with section chips and compact spacing.",
    previewImage: "",
    demo: {
      template: "modern",
      profile: { name: "Diya Patel", email: "diya@example.com", phone: "+91 98888 88888", city: "Pune", summary: "Product-focused frontend dev." },
      education: [{ degree: "BE IT", institution: "VJTI", start: "2016-07-01", end: "2020-05-30" }],
      experience: [{ organization: "Media.net", location: "Mumbai", position: "Frontend Engineer", start: "2020-07-01", technologies: ["TypeScript","Next.js"] }],
      projects: [{ title: "News Revamp", description: "High-performance news UI." }],
      skills: [{ name: "TypeScript", level: 75 }, { name: "Next.js", level: 70 }]
    }
  },
  {
    key: "elegant",
    name: "Elegant",
    description: "Serif headings, soft separators, airy spacing.",
    previewImage: "",
    demo: {
      template: "elegant",
      profile: { name: "Karthik B", email: "karthik@example.com", phone: "+91 97777 77777", city: "Chennai", summary: "Detail-oriented UI developer." },
      education: [{ degree: "BSc CS", institution: "Anna University", start: "2015-07-01", end: "2018-05-30" }],
      experience: [{ organization: "Startup X", location: "Chennai", position: "Frontend Dev", start: "2018-08-01", technologies: ["Vue","Sass"] }],
      projects: [{ title: "Design System", description: "Reusable components & tokens." }],
      skills: [{ name: "Design Systems", level: 80 }, { name: "Accessibility", level: 65 }]
    }
  }
];

async function ensureSeeded() {
  const count = await Template.countDocuments();
  if (count === 0) {
    await Template.insertMany(defaults);
  }
}

export const listTemplates = async (req, res, next) => {
  try {
    await ensureSeeded();
    const items = await Template.find().sort({ createdAt: 1 }).lean();
    res.json({ items });
  } catch (e) { next(e); }
};

export const getTemplate = async (req, res, next) => {
  try {
    await ensureSeeded();
    const tpl = await Template.findOne({ key: req.params.key }).lean();
    if (!tpl) return res.status(404).json({ message: "Template not found" });
    res.json(tpl);
  } catch (e) { next(e); }
};
