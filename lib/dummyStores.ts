export type Store = {
  id: number
  name: string
  owner: string
  products: number
}

export const dummyStores: Store[] = [
  { id: 1, name: "Ahjin Armory", owner: "Jinwoo", products: 12 },
  { id: 2, name: "Shadow Shop", owner: "Beru", products: 7 },
]