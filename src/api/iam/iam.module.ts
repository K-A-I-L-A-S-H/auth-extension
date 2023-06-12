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
import { RefreshTokenIdsStorage } from './authorizarion/refreshTokenIds.storage';
import { RedisService } from '@/lib/redis/redis.service';
import { RoleGuard } from '@/lib/guards/roles.guard';
import { PermissionGuard } from '@/lib/guards/permission.guard';
import { ApiKeyGuard } from '@/lib/guards/apiKey.guard';
import { ApiKeysController } from './apiKeys/apiKeys.controller';
import { ApiKeysService } from './apiKeys/apiKeys.service';
import { GoogleAuthService } from './authentication/social/googleAuth.service';
import { GoogleAuthController } from './authentication/social/googleAuth.controller';
import { OTPAuthenticationService } from './authentication/otpAuthentication/otpAuthentication.service';

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
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    AccessTokenGuard,
    ApiKeyGuard,
    ApiKeysService,
    AuthenticationService,
    GoogleAuthService,
    OTPAuthenticationService,
    PrismaService,
    RedisService,
    RefreshTokenIdsStorage,
  ],
  controllers: [
    ApiKeysController,
    AuthenticationController,
    GoogleAuthController,
  ],
})
export class IAMModule {}
