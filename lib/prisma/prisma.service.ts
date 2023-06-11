import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const options: Prisma.PrismaClientOptions = {
      errorFormat: 'pretty',
      log: [{ level: 'info', emit: 'stdout' }],
    };

    if (configService.get('ENABLE_PRISMA_LOG')) {
      options.log?.push({ level: 'warn', emit: 'stdout' });
      options.log?.push({ level: 'error', emit: 'stdout' });
      options.log?.push({ level: 'query', emit: 'event' });
    }

    super(options);
  }

  async onModuleInit() {
    await this.$connect();

    if (this.configService.get('ENABLE_PRISMA_LOG')) {
      this.$on(
        //@ts-expect-error
        'query',
        ({
          query,
          params,
          duration,
        }: {
          query: string;
          params: string;
          duration: string;
        }) => {
          const paramList = JSON.parse(params) as string[];
          let queryString = query;

          for (const param of paramList) {
            queryString = queryString.replace('?', param);
          }
          this.logger.log({
            query: queryString,
            duration: `${duration}ms`,
          });
        },
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHook(app: INestApplication) {
    return new Promise((resolve) => {
      this.$on('beforeExit', async () => {
        resolve(async () => await app.close());
      });
    });
  }
}
