import { Router } from "express";

import { requiredAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
  createTransaction,
  getTransactions,
} from "./transactions.contriller.js";
import { createTransactionSchema } from "./transactions.schema.js";

const router = Router();

router.get("/", requiredAuth, getTransactions);

router.post(
  "/",
  requiredAuth,
  validate(createTransactionSchema),
  createTransaction
);

export default router;
