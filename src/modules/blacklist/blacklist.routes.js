import express from "express";

import { requiredAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
  createBlacklistController,
  getBlacklistController,
  deleteBlacklistController,
} from "./blacklist.controller.js";

import { createBlacklistEntrySchema } from "./blacklist.schema.js";

const router = express.Router();

router.post(
  "/",
  requiredAuth,
  validate(createBlacklistEntrySchema),
  createBlacklistController
);

router.get("/", requiredAuth, getBlacklistController);

router.delete("/:id", requiredAuth, deleteBlacklistController);

export default router;
