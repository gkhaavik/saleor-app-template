import { z } from "zod";

export const VippsMobilePayConfigSchema = z.object({
  merchantSerialNumber: z.string().min(1),
  subscriptionKey: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  systemName: z.string().min(1).max(30),
  systemVersion: z.string().min(1).max(30),
  systemPluginName: z.string().min(1).max(30),
  systemPluginVersion: z.string().min(1).max(30),
  testMode: z.boolean().default(false),
});

export type VippsMobilePayConfig = z.infer<typeof VippsMobilePayConfigSchema>; 