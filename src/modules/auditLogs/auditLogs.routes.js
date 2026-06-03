import express from "express";

import { requiredAuth } from "../../middleware/auth.js";
import { getAuditLogsController } from "./auditLogs.controller.js";

const router = express.Router();

router.get("/", requiredAuth, getAuditLogsController);

export default router;
