import express from "express";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import transactionsRoutes from "./modules/transactions/transactions.routes.js";
import alertsRoutes from "./modules/alerts/alerts.routes.js";
import casesRoutes from "./modules/cases/cases.routes.js";
import auditLogsRoutes from "./modules/auditLogs/auditLogs.routes.js";
import blacklistRoutes from "./modules/blacklist/blacklist.routes.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "FinGuard API is running   ",
  });
});

app.use("/auth", authRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/alerts", alertsRoutes);
app.use("/cases", casesRoutes);
app.use("/audit-logs", auditLogsRoutes);
app.use("/blacklist", blacklistRoutes);

app.use((req, res, next) => {
  next({
    status: 404,
    name: "NotFound",
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;
