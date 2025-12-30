export interface KotItem {
  itemName: string;
  qty: number;
  specialNote?: string;
}

export interface KotSnapshot {
  id: number;
  kotNo: number;
  kotNumber: string;
  tableId: string;
  createdAt: string;
  items: KotItem[];
}
