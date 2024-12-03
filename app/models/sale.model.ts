export interface Sale {
  id?: string;
  shoeId: string;
  shoeName: string;
  size: string;
  buyerName: string;
  phoneNumber: string;
  quantity: number;
  sellingPrice: number;
  amountPaid: number;
  date: Date;
  purchaseCost: number;
}