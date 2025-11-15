import { Injectable, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib'; // Correct import location
import { getEnv } from '../utils/env.util';
import { EmailService } from './email.service';

interface EmailData {
  email: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern(getEnv('RMQ_QUEUE', ''))
  async handleDailySalesReport(
    @Payload() data: EmailData,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const originalMessage = context.getMessage() as Message;

    try {
      this.logger.log(`📧 Received email task for: ${data.email}`);

      await this.emailService.sendEmail(data.email, data.subject, data.body);

      this.logger.log(`✅ Email sent to: ${data.email}`);
      channel.ack(originalMessage);
    } catch (error: unknown) {
      // Proper error handling with type safety
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `❌ Failed to send email to: ${data.email}`,
        errorMessage,
      );

      // Optionally add delay before nack or implement retry logic
      channel.nack(originalMessage, false, false);
    }
  }
}
