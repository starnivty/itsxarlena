import { z } from "zod"

export const variantSchema = z.object({
  product: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  stock: z.coerce.number().int().min(0, "Stock must be >= 0"),
})

export type VariantInput = z.infer<typeof variantSchema>
