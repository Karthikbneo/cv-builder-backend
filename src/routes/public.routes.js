import { Router } from "express";
import { getSharedCV, getSharedPdf } from "../controllers/public.controller.js";

const r = Router();

r.get("/cv/:id", getSharedCV);

r.get("/cv/:id/pdf", getSharedPdf);

export default r;
