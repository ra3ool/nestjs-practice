import { Injectable, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { getEnv } from '../utils/env.util';
import { EmailService } from './email.service';

@Injectable()
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern(getEnv('RMQ_QUEUE'))
  async handleDailySalesReport(
    @Payload() data: { email: string; subject: string; body: string },
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      this.logger.log(`📧 Received email task for: ${data.email}`);

      await this.emailService.sendEmail(data.email, data.subject, data.body);

      this.logger.log(`✅ Email sent to: ${data.email}`);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to: ${data.email}`, error);
      channel.nack(originalMessage);
    }
  }
}
