/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Create the main HTTP application
  const app = await NestFactory.create(AppModule);

  // Set up global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties that do not have decorators
      forbidNonWhitelisted: true, // throws error if unknown properties are sent
      transform: true, // transforms payloads to match DTO classes
    }),
  );

  // Create a microservice for RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'], // RabbitMQ URL
      queue: 'daily_sales_report', // Queue name
      queueOptions: {
        durable: true,
      },
    },
  });

  // Start both the HTTP server and the microservice
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
