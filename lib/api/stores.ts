export type Store = {
  id: number
  name: string
  admin_wa: string
  pricelist_url: string
}

const BASE_URL = "/api/stores"

export async function getStores(): Promise<Store[]> {
  const res = await fetch(BASE_URL)

  if (!res.ok) {
    throw new Error("Failed to fetch stores")
  }

  return res.json()
}

export async function updateStore(
  id: number,
  data: Omit<Store, "id">
): Promise<Store> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? "Failed to update store")
  }

  return res.json()
}

export async function deleteStore(id: number): Promise<Store> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? "Failed to delete store")
  }

  return res.json()
}

export async function createStore(
  data: Omit<Store, "id">
): Promise<Store> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? "Failed to create store")
  }

  return res.json()
}

