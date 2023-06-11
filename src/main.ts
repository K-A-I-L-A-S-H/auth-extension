import { NestFactory } from '@nestjs/core';
import { AppModule } from './app';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { ApiVersions } from './constants';
import { PrismaService } from 'lib/prisma';

async function bootstrap() {
  const logger = new Logger('NestApplicationLogger');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ApiVersions.V1,
  });
  app.enableCors();

  const prismaService = app.get(PrismaService);
  void prismaService.enableShutdownHook(app);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port);
  logger.log(`Listening on port ${port}...`);
}

bootstrap();
