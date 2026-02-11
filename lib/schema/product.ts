import { z } from "zod"

export const productSchema = z.object({
  category: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  stock: z.coerce.number().int().min(0, "Stock must be >= 0"),
})

export type ProductInput = z.infer<typeof productSchema>
