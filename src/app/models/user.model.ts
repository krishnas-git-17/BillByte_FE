export interface User {
  id: number;
  employeeId: string;
  name: string;
  email?: string;
  role: number;
  roleName?: string;
  isActive: boolean;
}
