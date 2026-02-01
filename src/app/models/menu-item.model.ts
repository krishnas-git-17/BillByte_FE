export interface MenuItem {
  menuId: string;
  name: string;
  type: string;
  vegType: string;
  status: string;
  price: number;
  imageUrl?: string | null;
  createdBy?: string;
}