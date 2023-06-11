import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '@/lib/prisma';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from '@/lib/guards/accessToken.guard';
import { AuthenticationGuard } from '@/lib/guards/authentication.guard';
import { RefreshTokenIdsStorage } from './authentication/refreshTokenIds.storage';
import { RedisService } from '@/lib/redis/redis.service';

const JWT_MODULE = JwtModule.register({
  global: true,
  secret: process.env.JWT_SECRET,
  verifyOptions: {
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    maxAge: process.env.JWT_ACCESS_TOKEN_TTL,
  },
});

@Module({
  imports: [JWT_MODULE],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    AuthenticationService,
    PrismaService,
    RedisService,
    RefreshTokenIdsStorage,
  ],
  controllers: [AuthenticationController],
})
export class IAMModule {}
