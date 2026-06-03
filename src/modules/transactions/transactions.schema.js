import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(3).max(5),
  type: z.enum(["deposit", "withdrawal", "transfer"]),

  entityType: z
    .enum(["email", "wallet", "merchant", "account", "ip"])
    .optional(),

  entityValue: z.string().min(1).max(255).optional(),
});
