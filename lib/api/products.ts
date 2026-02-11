export type Product = {
  id: number
  category: string
  name: string
  price: number
  stock: number
}

const BASE_URL = "/api/products"

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(BASE_URL)

  if (!res.ok) {
    throw new Error("Failed to fetch products")
  }

  return res.json()
}

export async function updateProduct(
  id: number,
  data: Omit<Product, "id">
): Promise<Product> {
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

export async function deleteProduct(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? "Failed to delete product")
  }

  return res.json()
}

export async function createProduct(
  data: Omit<Product, "id">
): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? "Failed to create product")
  }

  return res.json()
}

