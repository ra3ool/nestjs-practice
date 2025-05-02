/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    try {
      const emailConfig = {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_ENCRYPTION === 'ssl', // Use SSL if encryption is set to 'ssl'
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      };
      const transporter = nodemailer.createTransport(emailConfig);

      // Send the email
      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
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
