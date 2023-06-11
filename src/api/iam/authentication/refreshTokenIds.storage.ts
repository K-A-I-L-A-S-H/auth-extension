import { InvalidateRefreshTokenError } from '@/lib/exceptions/invalidatedToken.exception';
import { RedisService } from '@/lib/redis/redis.service';
import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class RefreshTokenIdsStorage implements OnApplicationShutdown {
  private readonly logger = new Logger(RefreshTokenIdsStorage.name);
  constructor(private readonly redisService: RedisService) {}

  onApplicationShutdown(signal?: string | undefined) {
    this.logger.log(`Signal: ${signal}`);
    return this.redisService.shutDown();
  }

  async insertToken(userId: string, tokenId: string): Promise<void> {
    return this.redisService.set(this.getToken(userId), tokenId);
  }

  async validateToken(userId: string, tokenId: string): Promise<boolean> {
    const cachedId = await this.redisService.get(this.getToken(userId));
    if (cachedId !== tokenId) {
      throw new InvalidateRefreshTokenError();
    }
    return cachedId === tokenId;
  }

  async invalidateToken(userId: string): Promise<void> {
    await this.redisService.remove(this.getToken(userId));
  }

  private getToken(userId: string): string {
    return `user-${userId}`;
  }
}
