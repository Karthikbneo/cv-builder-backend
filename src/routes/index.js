import { Router } from "express";
import authRoutes from "./auth.routes.js";
import cvRoutes from "./cv.routes.js";
import uploadRoutes from "./upload.routes.js";
import paymentRoutes from "./payment.routes.js";
import shareRoutes from "./share.routes.js";
import templateRoutes from "./template.routes.js";
import publicRoutes from "./public.routes.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/cvs", cvRoutes);
router.use("/uploads", uploadRoutes);
router.use("/payments", paymentRoutes);
router.use("/shares", shareRoutes);
router.use("/templates", templateRoutes);
router.use("/public", publicRoutes); 

export default router;
