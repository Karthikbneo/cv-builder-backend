import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { listMyCVs, createCV, getCV, updateCV, deleteCV, downloadPdf } from "../controllers/cv.controller.js";
import { createCvRules, idParam } from "../validators/cv.validation.js";
import { runValidation } from "../middlewares/validate.js";

const r = Router();
r.use(requireAuth);
r.get("/", listMyCVs);
r.post("/", createCvRules, runValidation, createCV);
r.get("/:id", idParam, runValidation, getCV);
r.put("/:id", idParam, runValidation, updateCV);
r.delete("/:id", idParam, runValidation, deleteCV);

r.get('/:id/pdf', downloadPdf);


export default r;
