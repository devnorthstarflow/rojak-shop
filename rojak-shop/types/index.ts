export interface Product {
  id: string
  name: string
  ref: string
  img: string
  url: string
  category: string
  subcategory: string
  brand?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Category {
  name: string
  icon: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  name: string
  url: string
  category: string
}
