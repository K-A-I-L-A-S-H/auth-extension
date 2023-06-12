import { Injectable } from '@nestjs/common';
import { ActiveUserData, GeneratedApiKeyPayload } from '../types';
import { HashingService } from '../hashing/hashing.service';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/lib/prisma';

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prisma: PrismaService,
  ) {}

  async createAndHash(id: string): Promise<GeneratedApiKeyPayload> {
    const apiKey = this.generateApiKey(id);
    const hashedKey = await this.hashingService.hash(apiKey);

    return {
      apiKey,
      hashedKey,
    } satisfies GeneratedApiKeyPayload;
  }

  async validate(apiKey: string, hashedKey: string): Promise<boolean> {
    return this.hashingService.compare(apiKey, hashedKey);
  }

  extractIdFromApiKey(apiKey: string): string {
    const [id] = Buffer.from(apiKey, 'base64').toString('ascii').split('.');
    return id;
  }

  private generateApiKey(id: string): string {
    const apiKey = `${id}.${randomUUID()}`;
    return Buffer.from(apiKey).toString('base64');
  }

  async createApiKey(user: ActiveUserData): Promise<string> {
    const uniqueId = randomUUID();
    const { apiKey, hashedKey } = await this.createAndHash(uniqueId);
    await this.prisma.apiKey.create({
      data: {
        id: uniqueId,
        userId: user.sub,
        key: hashedKey,
      },
    });
    return apiKey;
  }
}

// YTkyZmFhMGEtNDAwYi00NzdlLTk1NzgtYzUxOTg4ZDU5OTQ1LmViOTAzNDg0LWIzMGUtNGI4ZC04NDU0LTRjNzcxOWMzNTc5Ng==
