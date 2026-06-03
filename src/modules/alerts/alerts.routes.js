import express from "express";

import { requiredAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
  getAlertsController,
  updateAlertStatusController,
} from "./alerts.controller.js";

import { updateAlertStatusSchema } from "./alerts.schema.js";

const router = express.Router();

router.get("/", requiredAuth, getAlertsController);

router.patch(
  "/:id/status",
  requiredAuth,
  validate(updateAlertStatusSchema),
  updateAlertStatusController
);

export default router;
