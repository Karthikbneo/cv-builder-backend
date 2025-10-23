import { body, param } from "express-validator";
export const createCvRules = [
  body("template").optional().isString(),
  body("profile.name").notEmpty().withMessage("Name is required"),
  body("profile.email").isEmail().withMessage("Valid email required")
];
export const idParam = [ param("id").isMongoId().withMessage("Invalid ID") ];
