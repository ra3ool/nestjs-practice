import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/user/user.entity';
import { EmailModule } from '../email/email.module';
import { getEnv } from '../utils/env.util';
import { InvoiceItem } from './entity/invoice-item.entity';
import { Invoice } from './entity/invoice.entity';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

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
