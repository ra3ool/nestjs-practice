import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PaginationInterceptor } from 'src/interceptors/pagination.interceptor';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/user/user.entity';
import { GetUser } from '../decorators/user.decorator';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import { InvoiceDto, InvoiceIdDto } from './dto/invoice.dto';
import { Invoice } from './entity/invoice.entity';
import { InvoiceResponse } from './invoice.model';
import { InvoiceService } from './invoice.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
@UseInterceptors(PaginationInterceptor)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  getAllInvoices(
    @GetUser() user: User,
    @Query() filters: InvoiceFiltersDto,
  ): Promise<InvoiceResponse> {
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
