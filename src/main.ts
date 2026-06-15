import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { PaginationInterceptor } from './interceptors/pagination.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: true }); //TODO delete this in production
  // app.useGlobalInterceptors(new PaginationInterceptor()); //can use globally or just add to each module controller

  await app.startAllMicroservices();
  await app.listen(3000);
}

void bootstrap();
