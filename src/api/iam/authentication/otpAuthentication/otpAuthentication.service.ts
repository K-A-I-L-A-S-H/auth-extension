import { PrismaService } from '@/lib/prisma';
import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator, totp } from 'otplib';
import Cryptr from 'cryptr';
import { ActiveUserData } from '../../types';

export interface OtpSecret {
  uri?: string;
  secret: string;
  otp?: string;
}

@Injectable()
export class OTPAuthenticationService implements OnModuleInit {
  private encryptor: Cryptr;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.encryptor = new Cryptr(this.configService.get('CRYPTR_SECRET')!);
    totp.options = {
      step: parseInt(this.configService.get('TOTP_STEP')!),
    };
  }

  generateSecret(email: string): OtpSecret {
    const secret = authenticator.generateSecret();
    const appName = this.configService.get('TFA_APP_NAME');
    const uri = authenticator.keyuri(email, appName, secret);

    return {
      uri,
      secret,
    } satisfies OtpSecret;
  }

  generateOtp(email: string): OtpSecret {
    const secret = authenticator.generateSecret();
    const otp = totp.generate(secret);

    return {
      otp,
      secret,
    } satisfies OtpSecret;
  }

  verifyCode(code: string, secret: string): boolean {
    return authenticator.verify({
      token: code,
      secret: this.encryptor.decrypt(secret),
    });
  }

  async verifyOtp(otp: string, user: ActiveUserData) {
    try {
      const { tfaSecret } = await this.prisma.user.findFirstOrThrow({
      where: {
        id: user.sub,
      },
      select: {
        tfaSecret: true,
      }
    });
    const secret = this.encryptor.decrypt(tfaSecret!);
    console.log({secret});

    return totp.verify({
      token: otp,
      secret: secret,
    });

    } catch(err) {
      throw new UnauthorizedException();
    }
  }

  async enableTfaForUser(email: string, secret: string) {
    const { id } = await this.prisma.user.findFirstOrThrow({
      where: { email },
      select: {
        id: true,
      },
    });

    await this.prisma.user.updateMany({
      where: { id },
      data: {
        isTfaEnabled: true,
        tfaSecret: this.encryptor.encrypt(secret),
      },
    });
  }
}
