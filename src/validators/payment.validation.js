import { body } from "express-validator";
// export const createIntentRules = [
//   body("cvId").isMongoId().withMessage("cvId is required"),
//   body("action").isIn(["download", "share"]).withMessage("action must be download|share")
// ];


export const paymentIntentRules = [
  body("cvId").isMongoId().withMessage("cvId is required"),
  body("action").isIn(["download", "share"]).withMessage("action must be download|share"),
  body("description").optional().isString().isLength({ min: 3, max: 500 })
];