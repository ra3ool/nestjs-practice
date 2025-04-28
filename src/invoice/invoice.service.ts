import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from './invoice.schema';
import { InvoiceDto } from './dto/invoice.dto';
import { User } from '../auth/user/user.model';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceFilters } from './invoice.model';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>,
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
      date: new Date(), // Automatically set the date
    });
    return newInvoice.save();
  }
}
