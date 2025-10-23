import multer from "multer";
import path from "node:path";
import env from "../config/env.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) return cb(new Error("Only JPG/PNG/WEBP allowed"));
  cb(null, true);
};

export default multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB
