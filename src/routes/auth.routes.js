import { Router } from "express";
import { register, login, refresh } from "../controllers/auth.controller.js";
import { registerRules, loginRules } from "../validators/auth.validation.js";
import { runValidation } from "../middlewares/validate.js";

const r = Router();
r.post("/register", registerRules, runValidation, register);
r.post("/login", loginRules, runValidation, login);
r.post("/refresh", refresh);
export default r;
