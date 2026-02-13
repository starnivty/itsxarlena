"use client"

import ProductForm from "@/components/VariantForm"
import { VariantInput } from "@/lib/schema/variant"

type Props = {
  onClose: () => void
  onSubmit: (data: VariantInput) => Promise<void> | void
}

export default function CreateVariantModal({ onClose, onSubmit }: Props) {
  async function handleCreate(data: VariantInput) {
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
          <h2 className="font-semibold">Add Variant</h2>
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
