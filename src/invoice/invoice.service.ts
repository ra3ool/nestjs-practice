import { Injectable, NotFoundException } from '@nestjs/common';
import { Invoice } from './invoice.model';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceDto } from './dto/invoice.dto';
import { IUser } from 'src/auth/user.model';

@Injectable()
export class InvoiceService {
  private invoices: Invoice[] = []; // Specify the type of the invoices array

  getAllInvoices(): Invoice[] {
    return this.invoices;
  }

  getInvoiceById(id: string): Invoice {
    const invoice = this.invoices.find((invoice) => invoice.id === id);
    if (!invoice)
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    return invoice;
  }

  addInvoice(invoiceData: InvoiceDto, user: IUser): Invoice {
    // Ensure the input data excludes the 'id' field
    const invoice: Invoice = {
      id: uuidv4(),
      userId: user.username,
      createdAt: new Date(),
      ...invoiceData,
    };
    this.invoices.push(invoice);
    return invoice;
  }
}
