"use client"

import ProductForm from "@/components/ProductForm"
import { ProductInput } from "@/lib/schema/product"

type Props = {
  onClose: () => void
  onSubmit: (data: ProductInput) => Promise<void> | void
}

export default function CreateProductModal({ onClose, onSubmit }: Props) {
  async function handleCreate(data: ProductInput) {
    //const created = await createProduct(data)
    // onSubmit(created)
    await onSubmit(data)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded shadow"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="font-semibold">Add Product</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="p-4">
          <ProductForm
            submitLabel="Save"
            onSubmit={handleCreate}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}
