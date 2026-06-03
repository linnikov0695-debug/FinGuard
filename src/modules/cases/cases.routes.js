import express from "express";

import { requiredAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
  createCaseController,
  getCasesController,
  updateCaseStatusController,
} from "./cases.controller.js";

import { createCaseSchema, updateCaseStatusSchema } from "./cases.schema.js";

const router = express.Router();

router.post(
  "/",
  requiredAuth,
  validate(createCaseSchema),
  createCaseController
);

router.get("/", requiredAuth, getCasesController);

router.patch(
  "/:id/status",
  requiredAuth,
  validate(updateCaseStatusSchema),
  updateCaseStatusController
);

export default router;
