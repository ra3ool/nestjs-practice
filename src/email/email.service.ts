/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getEnv } from '../utils/env.util';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    try {
      const emailConfig = {
        host: getEnv('EMAIL_HOST'),
        port: Number(getEnv('EMAIL_PORT')),
        secure: getEnv('EMAIL_ENCRYPTION') === 'ssl',
        auth: {
          user: getEnv('EMAIL_USER'),
          pass: getEnv('EMAIL_PASS'),
        },
      };
      const transporter = nodemailer.createTransport(emailConfig);

      // Send the email
      await transporter.sendMail({
        from: `"${getEnv('EMAIL_FROM_NAME')}" <${getEnv('EMAIL_FROM')}>`,
        to,
        subject,
        text,
      });

      this.logger.log(`✅ Email sent to: ${to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to: ${to}`, error);
    }
  }
}
