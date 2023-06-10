import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'lib/prisma';

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
    PrismaService,
    AuthenticationService,
  ],
  controllers: [AuthenticationController],
})
export class IAMModule {}
