import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  FindOptionsWhere,
  DataSource,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { User } from '../auth/user/user.entity';
import { InvoiceDto, InvoiceItemsDto } from './dto/invoice.dto';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { getEnv } from 'src/utils/env.util';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject('EMAIL_SERVICE')
    private readonly rabbitMQClient: ClientProxy,

    private readonly dataSource: DataSource,
  ) {}

  async getAllInvoices(
    user: User,
    filters?: InvoiceFiltersDto,
  ): Promise<Invoice[]> {
    // Use FindOptionsWhere<Invoice> for type safety
    const where: FindOptionsWhere<Invoice> = { customer: { id: user.id } };

    if (filters) {
      if (filters.startDate || filters.endDate) {
        where.date = Between(
          filters.startDate || new Date(0),
          filters.endDate || new Date(),
        );
      }

      if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
        where.amount = Between(filters.minAmount, filters.maxAmount);
      } else if (filters.minAmount !== undefined) {
        where.amount = MoreThanOrEqual(filters.minAmount);
      } else if (filters.maxAmount !== undefined) {
        where.amount = LessThanOrEqual(filters.maxAmount);
      }
    }

    return this.invoiceRepository.find({
      where,
      relations: ['customer', 'items'],
      select: {
        customer: {
          id: true,
          username: true,
          email: true,
        },
      },
    });
  }

  async getInvoiceById(id: string, user: User): Promise<Invoice> {
    // Validate ID
    if (!id || isNaN(Number(id))) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    const invoice = await this.invoiceRepository.findOne({
      where: { id: Number(id), customer: { id: user.id } },
      relations: ['customer', 'items'],
      select: {
        customer: {
          id: true,
          username: true,
          email: true,
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async addInvoice(invoiceData: InvoiceDto, user: User): Promise<Invoice> {
    const { amount, items: incoiceItems } = invoiceData;

    return this.dataSource.transaction(async (manager) => {
      // Lock the user's invoices to prevent race conditions
      const invoiceCount = await manager.getRepository(Invoice).count({
        where: { customer: { id: user.id } },
        lock: { mode: 'pessimistic_write' },
      });

      if (invoiceCount >= 30) {
        throw new NotFoundException(
          'You cannot add more than 50 invoices. Please delete an existing invoice to add a new one.',
        );
      }

      if (!amount || amount <= 0) {
        throw new NotFoundException('Invalid invoice amount');
      }

      // Create Invoice entity with cascading items
      const invoice = manager.getRepository(Invoice).create({
        amount,
        reference: uuidv4(),
        customer: user,
        items: incoiceItems.map((item: InvoiceItemsDto) => ({
          sku: item.sku,
          qt: item.qt,
        })),
      });

      // Save Invoice and related items in one operation
      return manager.getRepository(Invoice).save(invoice);
    });
  }

  async deleteInvoice(id: string, user: User): Promise<{ message: string }> {
    return this.dataSource.transaction(async (manager) => {
      // Validate ID and lock the invoice row
      const invoice = await manager.getRepository(Invoice).findOne({
        where: { id: Number(id), customer: { id: user.id } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      await manager
        .getRepository(Invoice)
        .delete({ id: Number(id), customer: user });

      return {
        message: `Invoice with ID ${id} deleted successfully`,
      };
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async generateDailySalesSummary(): Promise<void> {
    this.logger.log('Generating daily sales summary for all users...');

    const users = await this.userRepository.find();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    for (const user of users) {
      try {
        const invoices = await this.invoiceRepository.find({
          where: {
            customer: { id: user.id },
            date: Between(startOfDay, endOfDay),
          },
          relations: ['items'],
        });

        const totalAmount = invoices.reduce(
          (sum, invoice) => sum + invoice.amount,
          0,
        );

        const itemSummaryMap = new Map<string, number>();

        invoices.forEach((invoice) => {
          invoice.items.forEach(({ sku, qt }) => {
            itemSummaryMap.set(sku, (itemSummaryMap.get(sku) || 0) + qt);
          });
        });

        const itemsSummary = Array.from(itemSummaryMap.entries()).map(
          ([sku, totalQuantity]) => ({ sku, totalQuantity }),
        );

        const report = {
          email: user.email,
          subject: 'Daily Sales Summary',
          body: `Your daily sales summary:\n\nTotal Sales: ${totalAmount}\nItems Summary: ${JSON.stringify(
            itemsSummary,
            null,
            2,
          )}`,
        };

        this.rabbitMQClient.emit(getEnv('RMQ_QUEUE'), report);

        this.logger.log(`✅ Email task added to queue for ${user.email}`);
      } catch (error) {
        this.logger.error(`❌ Failed to process user ${user.email}`, error);
      }
    }
  }
}
