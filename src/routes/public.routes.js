import { Router } from "express";
import { getSharedCV, getSharedPdf } from "../controllers/public.controller.js";

const r = Router();

// GET /api/v1/public/cv/:id  -> public JSON (for preview page)
r.get("/cv/:id", getSharedCV);

// GET /api/v1/public/cv/:id/pdf -> public PDF (for “open as PDF”)
r.get("/cv/:id/pdf", getSharedPdf);

export default r;
