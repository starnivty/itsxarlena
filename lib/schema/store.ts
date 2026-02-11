import { z } from "zod"

export const storeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  admin_wa: z.string().min(1, "Admin WA is required"),
  pricelist_url: z.string().url("Invalid URL").optional().or(z.literal("")),
})

export type StoreInput = z.infer<typeof storeSchema>
