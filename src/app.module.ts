import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceModule } from './invoice/invoice.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from './email/email.module';
import { getEnv } from './utils/env.util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: getEnv('DB_HOST'),
      port: parseInt(getEnv('DB_PORT', '3306')),
      username: getEnv('DB_USERNAME'),
      password: getEnv('DB_PASSWORD'),
      database: getEnv('DB_NAME'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    InvoiceModule,
    AuthModule,
    EmailModule,
  ],
})
export class AppModule {}
