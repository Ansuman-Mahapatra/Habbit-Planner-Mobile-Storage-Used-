export interface Goal {
  id: string;
  name: string;
  description?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  createdAt: string;
}
