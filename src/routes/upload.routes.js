import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { uploadImage } from "../controllers/upload.controller.js";

const r = Router();
r.use(requireAuth);
r.post("/image", upload.single("file"), uploadImage);
export default r;
