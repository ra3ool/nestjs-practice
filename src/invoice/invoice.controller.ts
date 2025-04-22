import { Body, Controller, Get, Post } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { Invoice } from "./invoice.model";
import { InvoiceDto } from "./dto/invoice.dto";

@Controller('invoices')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Get()
    getAllInvoices(): Invoice[] {
        return this.invoiceService.getAllInvoices()
    }

    @Post()
    addInvoice(@Body() invoice: InvoiceDto): Invoice {
        return this.invoiceService.addInvoice(invoice)
    }
}