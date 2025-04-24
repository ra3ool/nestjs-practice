import { Injectable, NotFoundException } from '@nestjs/common';
import { Invoice } from './invoice.model';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceDto } from './dto/invoice.dto';
import { User } from 'src/auth/user.model';

@Injectable()
export class InvoiceService {
  private invoices: Invoice[] = []; // Specify the type of the invoices array

  getAllInvoices(user: User): Invoice[] {
    return this.invoices.filter(
      (invoice) => invoice.customer === user.username,
    );
  }

  getInvoiceById(id: string, user: User): Invoice {
    const invoice = this.invoices.find(
      (invoice) =>
        invoice.customer === user.username && invoice.reference === id,
    );
    if (!invoice)
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    return invoice;
  }

  addInvoice(invoiceData: InvoiceDto, user: User): Invoice {
    const { amount, items } = invoiceData;
    const invoice: Invoice = {
      reference: uuidv4(),
      customer: user.username,
      date: new Date(),
      amount,
      items,
    };
    this.invoices.push(invoice);
    return invoice;
  }
}
