export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface Medicine {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  expiry_date: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface SaleItem {
  id: string;
  medicine_id: string;
  quantity: number;
  price: number;
  name?: string;
}

export interface Sale {
  id: string;
  total: number;
  discount: number;
  final_total: number;
  date: string;
  items: SaleItem[];
}

export interface AccountingEntry {
  id: string;
  date: string;
  field1: number;
  field2: number;
  field3: number;
  field4: number;
  status: 'draft' | 'finished';
}

