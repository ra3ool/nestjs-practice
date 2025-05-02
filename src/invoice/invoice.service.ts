/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from './invoice.schema';
import { InvoiceDto } from './dto/invoice.dto';
import { User } from '../auth/user/user.model';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceFilters } from './invoice.model';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>,
    @Inject('EMAIL_SERVICE') private readonly rabbitMQClient: ClientProxy,
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

    // Use aggregation to fetch distinct customers and their emails
    const usersWithEmails = await this.invoiceModel.aggregate([
      {
        $group: {
          _id: '$customer', // Group by customer ID
        },
      },
      {
        $addFields: {
          _id: { $toObjectId: '$_id' }, // Convert _id to ObjectId if needed
        },
      },
      {
        $lookup: {
          from: 'users', // Join with the 'users' collection
          localField: '_id', // Match '_id' from the group (customer ID)
          foreignField: '_id', // Match '_id' in the 'users' collection
          as: 'userDetails', // Output the joined data in 'userDetails'
        },
      },
      {
        $unwind: '$userDetails', // Unwind the 'userDetails' array
      },
      {
        $project: {
          customerId: '$_id', // Include the customer ID
          email: '$userDetails.email', // Include the user's email
        },
      },
    ]);

    for (const user of usersWithEmails) {
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Calculate total sales for the day for the current user
        const totalSales = await this.invoiceModel.aggregate([
          {
            $match: {
              customer: user.customerId,
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
              customer: user.customerId,
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
          email: user.email,
          subject: 'Daily Sales Summary',
          body: `Your daily sales summary:\n\nTotal Sales: ${totalSales[0]?.totalAmount || 0}\nItems Summary: ${JSON.stringify(
            itemsSummary,
            null,
            2,
          )}`,
        };

        // Publish the email task to RabbitMQ
        this.rabbitMQClient.emit('daily_sales_report', report);

        this.logger.log(
          `✅ Email task added to queue for user ${user.customerId} (${user.email}).`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Failed to process user ${user.customerId}:`,
          error,
        );
      }
    }
  }
}
