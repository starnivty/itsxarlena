export type Variant = {
  id: number
  product: string
  name: string
  price: number
  stock: number
}

const BASE_URL = "/api/variants"

export async function getVariants(): Promise<Variant[]> {
  const res = await fetch(BASE_URL)

  if (!res.ok) {
    throw new Error("Failed to fetch variants")
  }

  return res.json()
}

export async function updateVariant(
  id: number,
  data: Omit<Variant, "id">
): Promise<Variant> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? "Failed to update product")
  }

  return res.json()
}

export async function deleteVariant(id: number): Promise<Variant> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? "Failed to delete variant")
  }

  return res.json()
}

export async function createVariant(
  data: Omit<Variant, "id">
): Promise<Variant> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? "Failed to create variant")
  }

  return res.json()
}

