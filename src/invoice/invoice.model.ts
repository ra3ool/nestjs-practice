import { FindOptionsWhere } from 'typeorm';
import { Invoice as InvoiceEntity } from './entity/invoice.entity';

interface items {
  sku: string;
  qt: number;
}
export interface Invoice {
  customer: string;
  amount: number;
  reference: string;
  date: Date;
  items: items[];
}

export interface InvoiceQueryOptions {
  where: FindOptionsWhere<InvoiceEntity>;
  relations?: string[];
  select?: { customer: { id: boolean; username: boolean; email: boolean } };
  take?: number;
  skip?: number;
}

export interface InvoiceResponse {
  invoices: InvoiceEntity[];
  total?: number;
  page?: number;
  limit?: number;
}
