import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from './entity/invoice.entity';
import { InvoiceDto, InvoiceIdDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../decorators/user.decorator';
import { User } from '../auth/user/user.entity';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  getAllInvoices(
    @GetUser() user: User,
    @Query() filters: InvoiceFiltersDto,
  ): Promise<{
    invoices: Invoice[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  }> {
    return this.invoiceService.getAllInvoices(user, filters);
  }

  @Get(':id')
  getInvoiceById(
    @Param() dto: InvoiceIdDto,
    @GetUser() user: User,
  ): Promise<Invoice> {
    return this.invoiceService.getInvoiceById(dto, user);
  }

  @Post()
  addInvoice(
    @Body() invoice: InvoiceDto,
    @GetUser() user: User,
  ): Promise<Invoice> {
    return this.invoiceService.addInvoice(invoice, user);
  }

  @Delete(':id')
  deleteInvoice(
    @Param() dto: InvoiceIdDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.invoiceService.deleteInvoice(dto, user);
  }
}
