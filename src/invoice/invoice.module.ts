import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { EmailModule } from '../email/email.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { User } from '../auth/user/user.entity';
import { getEnv } from '../utils/env.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, User]),
    EmailModule,
    ClientsModule.registerAsync([
      {
        name: 'EMAIL_SERVICE',
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [getEnv('RMQ_URL')],
            queue: getEnv('RMQ_QUEUE'),
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
