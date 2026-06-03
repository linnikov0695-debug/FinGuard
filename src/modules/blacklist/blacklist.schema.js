import { z } from "zod";

export const createBlacklistEntrySchema = z.object({
  entityType: z.enum(["email", "wallet", "merchant", "account", "ip"]),

  entityValue: z.string().min(1).max(255),

  reason: z.string().max(500).optional(),
});
