import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.model';
import { InvoiceDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { IUser } from 'src/auth/user.model';
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  getAllInvoices(): Invoice[] {
    return this.invoiceService.getAllInvoices();
  }

  @Get(':id')
  getInvoiceById(@Param('id') id: string): Invoice {
    return this.invoiceService.getInvoiceById(id);
  }

  @Post()
  addInvoice(@Body() invoice: InvoiceDto, @User() user: IUser): Invoice {
    return this.invoiceService.addInvoice(invoice, user);
  }
}
