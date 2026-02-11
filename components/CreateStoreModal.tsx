"use client"

import StoreForm from "@/components/StoreForm"
import { createStore, Store } from "@/lib/api/stores"
import { StoreInput } from "@/lib/schema/store"

type Props = {
  onClose: () => void
  onSubmit: (data: StoreInput) => Promise<void> | void
}

export default function CreateStoreModal({ onClose, onSubmit }: Props) {
  async function handleCreate(data: StoreInput) {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    ) as Omit<Store, "id">
    const created = await createStore(cleanData)
    onSubmit(created)
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
          <StoreForm
            submitLabel="Save"
            onSubmit={handleCreate}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}
