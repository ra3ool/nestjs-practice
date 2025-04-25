import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from './invoice.schema';
import { InvoiceDto } from './dto/invoice.dto';
import { User } from '../auth/user.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>,
  ) {}

  async getAllInvoices(user: User): Promise<Invoice[]> {
    // Fetch invoices only for the authenticated user
    return this.invoiceModel.find({ customer: user.username }).exec();
  }

  async getInvoiceById(id: string, user: User): Promise<Invoice> {
    // Validate if the provided id is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    const invoice = await this.invoiceModel
      .findOne({ _id: id, customer: user.username })
      .exec();

    if (!invoice) {
      throw new NotFoundException(
        `Invoice with ID ${id} not found for user ${user.username}`,
      );
    }

    return invoice;
  }

  async addInvoice(invoiceData: InvoiceDto, user: User): Promise<Invoice> {
    const { amount, items } = invoiceData; // destructure amount and items from invoiceData
    const newInvoice = new this.invoiceModel({
      amount,
      items,
      reference: uuidv4(), // Generate a unique reference ID
      customer: user.username,
      date: new Date(), // Automatically set the date
    });
    return newInvoice.save();
  }
}
