import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getEnv } from '../utils/env.util';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: getEnv('EMAIL_HOST') as string,
      port: Number(getEnv('EMAIL_PORT')) as number,
      secure: (getEnv('EMAIL_ENCRYPTION') === 'ssl') as boolean,
      auth: {
        user: getEnv('EMAIL_USER') as string,
        pass: getEnv('EMAIL_PASS') as string,
      },
    }) as nodemailer.Transporter;
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${getEnv('EMAIL_FROM_NAME') as string}" <${getEnv('EMAIL_FROM') as string}>`,
        to,
        subject,
        text,
      });

      this.logger.log(`✅ Email sent to: ${to}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`❌ Failed to send email to: ${to}`, errorMessage);
      throw error;
    }
  }
}
