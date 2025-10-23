import { Router } from "express";
import { listTemplates, getTemplate } from "../controllers/template.controller.js";

const r = Router();
r.get("/", listTemplates);
r.get("/:key", getTemplate);

export default r;
