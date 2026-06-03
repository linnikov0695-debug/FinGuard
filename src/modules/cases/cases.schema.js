import { z } from "zod";

export const createCaseSchema = z.object({
  alertId: z.number().int().positive(),
  title: z.string().min(3).max(100),
  description: z.string().optional(),
});

export const updateCaseStatusSchema = z.object({
  status: z.enum(["open", "investigating", "closed"]),
});
