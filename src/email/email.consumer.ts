/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Injectable()
export class EmailConsumer {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('daily_sales_report')
  async handleDailySalesReport(@Payload() data: any): Promise<void> {
    const { email, report } = data;
    console.log(`📨 Received sales report for ${email}`);
    await this.emailService.sendEmail(email, 'daily report', report);
  }
}
