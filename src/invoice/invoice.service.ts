import { Injectable, NotFoundException } from "@nestjs/common";
import { Invoice } from "./invoice.model";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvoiceService {
    private invoices = []

    getAllInvoices(): Invoice[] {
        return this.invoices
    }

    getInvoiceById(id: string): Invoice {
        const invoice = this.invoices.find(invoice => invoice.id === id)
        if(!invoice) throw new NotFoundException
        return invoice
    }

    addInvoice(invoiceData): Invoice {
        const invoice = {
            id: uuidv4(),
            ...invoiceData
        }
        this.invoices.push(invoice)
        return invoice
    }
}