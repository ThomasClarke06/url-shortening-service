import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // Strips unknown JSON keys and validates DTOs (e.g. ShortenUrlDto) before controllers run.
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
