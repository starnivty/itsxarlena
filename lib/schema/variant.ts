import { z } from "zod"

export const variantSchema = z.object({
  store: z.string().min(1, "Store is required"),
  product: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
})

export type VariantInput = z.infer<typeof variantSchema>
