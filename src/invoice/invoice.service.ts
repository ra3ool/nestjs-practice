/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  /*Inject,*/
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from './invoice.schema';
import { InvoiceDto } from './dto/invoice.dto';
import { User } from '../auth/user/user.model';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceFilters } from './invoice.model';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from '../email/email.service';
// import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>,
    private readonly emailService: EmailService, // Inject EmailService
    // @Inject('RABBITMQ_SERVICE') private readonly rabbitMQClient: ClientProxy,
  ) {}

  async getAllInvoices(
    user: User,
    filters?: InvoiceFiltersDto,
  ): Promise<Invoice[]> {
    const query: InvoiceFilters = { customer: user.id };

    if (filters) {
      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) {
          query.date.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.date.$lte = filters.endDate;
        }
      }

      if (filters.minAmount || filters.maxAmount) {
        query.amount = {};
        if (filters.minAmount) {
          query.amount.$gte = filters.minAmount;
        }
        if (filters.maxAmount) {
          query.amount.$lte = filters.maxAmount;
        }
      }
    }

    return this.invoiceModel.find(query).exec();
  }

  async getInvoiceById(id: string, user: User): Promise<Invoice> {
    // Validate if the provided id is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    const invoice = await this.invoiceModel
      .findOne({ _id: id, customer: user.id })
      .exec();

    if (!invoice) {
      throw new NotFoundException(
        `Invoice with ID ${id} not found for user ${user.username}`,
      );
    }

    return invoice;
  }

  async addInvoice(invoiceData: InvoiceDto, user: User): Promise<Invoice> {
    const { amount, items } = invoiceData;
    const newInvoice = new this.invoiceModel({
      amount,
      items,
      reference: uuidv4(), // Generate a unique reference ID
      customer: user.id,
    });
    return newInvoice.save();
  }

  // Cron job to run daily at 12:00 PM
  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async generateDailySalesSummary(): Promise<void> {
    this.logger.log('Generating daily sales summary for all users...');

    // Fetch all unique users from the invoices
    const users = await this.invoiceModel.distinct('customer');

    for (const userId of users) {
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Calculate total sales for the day for the current user
        const totalSales = await this.invoiceModel.aggregate([
          {
            $match: {
              customer: userId,
              date: { $gte: startOfDay, $lte: endOfDay },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
            },
          },
        ]);

        // Calculate total quantity sold per item (grouped by SKU) for the current user
        const itemsSummary = await this.invoiceModel.aggregate([
          {
            $match: {
              customer: userId,
              date: { $gte: startOfDay, $lte: endOfDay },
            },
          },
          {
            $unwind: '$items',
          },
          {
            $group: {
              _id: '$items.sku',
              totalQuantity: { $sum: '$items.qt' },
            },
          },
        ]);

        // Prepare the message payload
        const report = {
          totalSales: totalSales[0]?.totalAmount || 0,
          itemsSummary,
        };

        // Fetch the user's email (mocked here, replace with actual user fetching logic)
        const userEmail = `user${userId}@example.com`; //TODO Replace with actual email fetching logic

        // Send the email (replace the logger with actual email sending logic)
        await this.emailService.sendEmail(
          userEmail,
          'Daily Sales Summary',
          `Your daily sales summary:\n\nTotal Sales: ${report.totalSales}\nItems Summary: ${JSON.stringify(
            report.itemsSummary,
            null,
            2,
          )}`,
        );
      } catch (error) {
        this.logger.error(`❌ Failed to process user ${userId}:`, error);
      }
    }
  }
}
