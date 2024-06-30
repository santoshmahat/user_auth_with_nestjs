import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<string>('PORT') || 4000;
  const allowedOrgins = configService.get<string>('ALLOWED_ORIGINS')
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

  app.enableCors({
    origin: allowedOrgins,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);
}
bootstrap();
