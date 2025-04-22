import { Body, Controller, Get, Post } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { Invoice } from "./invoice.model";

@Controller('invoices')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Get()
    getAllInvoices(): Invoice[] {
        return this.invoiceService.getAllInvoices()
    }

    @Post()
    addInvoice(@Body() invoice: Invoice): Invoice {
        return this.invoiceService.addInvoice(invoice)
    }
}