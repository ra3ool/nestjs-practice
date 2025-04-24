export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  description?: string;
  createdAt: Date;
}
