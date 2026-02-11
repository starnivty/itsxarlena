export type Product = {
  id: number
  name: string
  price: number
  stock: number
}

export const dummyProducts: Product[] = [
  { id: 1, name: "Iron Sword", price: 150000, stock: 12 },
  { id: 2, name: "Mana Potion", price: 50000, stock: 50 },
]