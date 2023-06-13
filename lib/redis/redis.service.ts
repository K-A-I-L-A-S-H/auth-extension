import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient: Redis;
  constructor(private readonly configService: ConfigService) {
  }

  onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
    });
  }

  shutDown() {
    return this.redisClient.quit();
  }

  async set(key: string, value: string) {
    await this.redisClient.set(key, value);
  }

  async get(key: string) {
    return this.redisClient.get(key);
  }

  async remove(key: string) {
    await this.redisClient.del(key);
  }
}
