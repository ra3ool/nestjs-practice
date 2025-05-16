import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  FindOptionsWhere,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceDto } from './dto/invoice.dto';
import { User } from '../auth/user/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject('EMAIL_SERVICE')
    private readonly rabbitMQClient: ClientProxy,
  ) { }

  async getAllInvoices(
    user: User,
    filters?: InvoiceFiltersDto,
  ): Promise<Invoice[]> {
    // Use FindOptionsWhere<Invoice> for type safety
    const where: FindOptionsWhere<Invoice> = { customer: user.id };

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
      relations: ['customer'],
    });
  }

  async getInvoiceById(id: string, user: User): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: Number(id), customer: { id: user.id } },
      relations: ['customer'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async addInvoice(invoiceData: InvoiceDto, user: User): Promise<Invoice> {
    const { amount, items } = invoiceData;

    const invoice = this.invoiceRepository.create({
      amount,
      items,
      reference: uuidv4(),
      customer: user,
    });

    return this.invoiceRepository.save(invoice);
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
            customer: { id: Number(user.id) },
            date: Between(startOfDay, endOfDay),
          },
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

        this.rabbitMQClient.emit(process.env.RMQ_QUEUE, report);

        this.logger.log(`✅ Email task added to queue for ${user.email}`);
      } catch (error) {
        this.logger.error(`❌ Failed to process user ${user.email}`, error);
      }
    }
  }
}
