export interface Shoe {
  id?: string;
  name: string;
  imageUrl?: string;
  sizes: ShoeSize[];
  purchaseCost: number;
  sellingPrice: number;
  lowStockThreshold: number;
}

export interface ShoeSize {
  size: string;
  quantity: number;
}