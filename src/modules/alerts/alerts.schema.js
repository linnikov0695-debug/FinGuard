import { z } from "zod";

export const updateAlertStatusSchema = z.object({
  status: z.enum(["open", "reviewed", "resolved"]),
});
