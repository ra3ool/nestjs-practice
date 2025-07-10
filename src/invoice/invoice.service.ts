import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  FindOptionsWhere,
  DataSource,
} from 'typeorm';
import { Invoice } from './entity/invoice.entity';
import { User } from '../auth/user/user.entity';
import { InvoiceDto, InvoiceIdDto, InvoiceItemsDto } from './dto/invoice.dto';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getEnv } from '../utils/env.util';
import axios from 'axios';
import { InvoiceQueryOptions } from './invoice.model';

//create message for sending in telegram
function getMessage(): string {
  const now = new Date();

  const persianDateString = now.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    calendar: 'persian',
    timeZone: 'Asia/Tehran',
    // numberingSystem: 'latn', // برای نمایش اعداد انگلیسی
  });

  const persianDayOfWeek = now.toLocaleDateString('fa-IR', {
    weekday: 'long',
    timeZone: 'Asia/Tehran',
  });

  const greetingText = `صبحت بخیر عزیز دلم. یه روز کاری دیگه رو پر قدرت استارت بزن
امروز ${persianDayOfWeek} هست به تاریخ ${persianDateString}
آرزو میکنم امروز حسابی بترکونی`;

  return greetingText;
}

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    private readonly dataSource: DataSource,
  ) {}

  async getAllInvoices(
    user: User,
    filters: InvoiceFiltersDto = {},
    includeRelations: boolean = true,
  ): Promise<{
    invoices: Invoice[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  }> {
    const where: FindOptionsWhere<Invoice> = { customer: { id: user.id } };

    if (filters.startDate || filters.endDate) {
      where.date = Between(
        filters.startDate ?? new Date(0),
        filters.endDate ?? new Date(),
      );
    }

    if (filters.minAmount !== undefined) {
      where.amount =
        filters.maxAmount !== undefined
          ? Between(filters.minAmount, filters.maxAmount)
          : MoreThanOrEqual(filters.minAmount);
    } else if (filters.maxAmount !== undefined) {
      where.amount = LessThanOrEqual(filters.maxAmount);
    }

    const queryOptions: InvoiceQueryOptions = {
      where,
      relations: includeRelations ? ['customer', 'items'] : [],
      select: includeRelations
        ? { customer: { id: true, username: true, email: true } }
        : undefined,
    };

    if (filters.limit !== undefined || filters.page !== undefined) {
      const limit = filters.limit ?? 10;
      const page = filters.page ?? 1;
      queryOptions.take = limit;
      queryOptions.skip = (page - 1) * limit;

      const [invoices, total] =
        await this.invoiceRepository.findAndCount(queryOptions);
      return {
        invoices,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    const invoices = await this.invoiceRepository.find(queryOptions);
    return { invoices };
  }

  async getInvoiceById(dto: InvoiceIdDto, user: User): Promise<Invoice> {
    const { id } = dto;
    const invoice = await this.invoiceRepository.findOne({
      where: { id, customer: { id: user.id } },
      relations: ['customer', 'items'],
      select: { customer: { id: true, username: true, email: true } },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async addInvoice(invoiceData: InvoiceDto, user: User): Promise<Invoice> {
    const { amount, items: invoiceItems } = invoiceData;

    return this.dataSource.transaction(async (manager) => {
      // Lock the user's invoices to prevent race conditions
      const invoiceCount = await manager.getRepository(Invoice).count({
        where: { customer: { id: user.id } },
        lock: { mode: 'pessimistic_write' },
      });

      if (invoiceCount >= 33) {
        throw new BadRequestException(
          'You cannot add more than 33 invoices. Please delete an existing invoice to add a new one.',
        );
      }

      if (!amount || amount <= 0) {
        throw new BadRequestException('Invalid invoice amount');
      }

      // Create Invoice entity with cascading items
      const invoice = manager.getRepository(Invoice).create({
        amount,
        reference: uuidv4(),
        customer: user,
        items: invoiceItems.map((item: InvoiceItemsDto) => ({
          sku: item.sku,
          qt: item.qt,
        })),
      });

      // Save Invoice and related items in one operation
      return manager.getRepository(Invoice).save(invoice);
    });
  }

  async deleteInvoice(
    dto: InvoiceIdDto,
    user: User,
  ): Promise<{ message: string }> {
    const { id } = dto;
    const result = await this.dataSource.transaction(async (manager) => {
      return manager
        .getRepository(Invoice)
        .delete({ id, customer: { id: user.id } });
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return { message: `Invoice with ID ${id} deleted successfully` };
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async generateDailyTelegramMessage(): Promise<void> {
    const message = getMessage();

    // Send message to Telegram
    const telegramBotToken = getEnv('TELEGRAM_BOT_TOKEN');
    const chatId = getEnv('TELEGRAM_CHAT_ID');
    const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    await axios.post(telegramApiUrl, {
      chat_id: chatId,
      text: message,
    });
  }
}
