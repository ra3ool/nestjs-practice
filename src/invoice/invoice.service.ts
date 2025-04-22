import { Injectable } from "@nestjs/common";
import { Invoice } from "./invoice.model";

@Injectable()
export class InvoiceService {
    private invoices = []

    getAllInvoices(): Invoice[] {
        return this.invoices
    }

    addInvoice(invoice): Invoice {
        this.invoices.push(invoice)
        return invoice
    }
}