/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import { PaginationInterceptor } from './interceptors/pagination.interceptor';

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
  app.enableCors({ origin: true }); // allows all origins //TODO delete this in production
  // app.useGlobalInterceptors(new PaginationInterceptor()); can use globally or just add to each module controller

  // Start both the HTTP server and the microservice
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
