import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import session from 'express-session';
import passport from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UserSerializer } from './authentication/serializers/userSerializer';
import { SessionAuthenticationController } from './authentication/sessionAuthentication.controller';
import { SessionAuthenticationService } from './authentication/sessionAuthentication.service';
import createRedisStore from 'connect-redis';
import { Redis } from 'ioredis';

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
    SessionAuthenticationService,
    UserSerializer,
  ],
  controllers: [
    ApiKeysController,
    AuthenticationController,
    GoogleAuthController,
    SessionAuthenticationController,
  ],
})
export class IAMModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const RedisStore = createRedisStore(session);

    consumer
      .apply(
        session({
          store: new RedisStore({
            client: new Redis(
              this.configService.get('REDIS_PORT')!,
              this.configService.get('REDIS_HOST')!,
            ),
          }),
          secret: this.configService.get('SESSION_SECRET')!,
          resave: false,
          saveUninitialized: false,
          cookie: {
            sameSite: true,
            httpOnly: true,
          },
        }),
        // @ts-expect-error
        passport.initialize(),
        // @ts-expect-error
        passport.session(),
      )
      .forRoutes('*');
  }
}
