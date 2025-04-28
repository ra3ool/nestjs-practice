import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.model';
import { InvoiceDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/user.decorator';
import { User } from '../auth/user/user.model';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  getAllInvoices(
    @GetUser() user: User,
    @Query() filters: InvoiceFiltersDto,
  ): Promise<Invoice[]> | null {
    return this.invoiceService.getAllInvoices(user, filters);
  }

  @Get(':id')
  getInvoiceById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Invoice> {
    return this.invoiceService.getInvoiceById(id, user);
  }

  @Post()
  addInvoice(
    @Body() invoice: InvoiceDto,
    @GetUser() user: User,
  ): Promise<Invoice> {
    return this.invoiceService.addInvoice(invoice, user);
  }
}
