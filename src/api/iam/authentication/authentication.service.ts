import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'lib/prisma';
import { SignUpDto } from './dto/signUp.dto';
import { HashingService } from '../hashing/hashing.service';
import { QueryErrorCodes } from 'src/constants';
import { SignInDto } from './dto/signIn.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ActiveUserData } from '../types';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { User } from '@prisma/client';

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup({ email, password }: SignUpDto) {
    const hashPassword = await this.hashService.hash(password);

    try {
      await this.prisma.user.create({
        data: {
          email,
          name: email,
          password: hashPassword,
        },
      });
    } catch (err: unknown) {
      const error = JSON.parse(err as string) as { code: string };
      if (error.code === QueryErrorCodes.PG_UNIQUE_VIOLATION_ERROR) {
        throw new ConflictException('Email already used');
      }
      throw err;
    }
  }

  async signin({ email, password }: SignInDto): Promise<SignInResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    const isValidPassword = await this.hashService.compare(
      password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Password in incorrect');
    }

    return this.generateTokens(user);
  }

  async generateTokens(user: User): Promise<SignInResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.configService.get('JWT_ACCESS_TOKEN_TTL')!,
        { email: user.email }
      ),
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.configService.get('JWT_REFRESH_TOKEN_TTL')!,
        { email: user.email }
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async signToken<T>(userId: string, expiresIn: string, payload: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.configService.get('JWT_TOKEN_AUDIENCE'),
        issuer: this.configService.get('JWT_TOKEN_ISSUER'),
        secret: this.configService.get('JWT_SECRET'),
        expiresIn,
      },
    );
  }

  async refreshTokens({ refreshToken: token }: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(token, {
        audience: this.configService.get('JWT_TOKEN_AUDIENCE'),
        issuer: this.configService.get('JWT_TOKEN_ISSUER'),
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.prisma.user.findFirstOrThrow({
        where: { id: sub },
      });

      return this.generateTokens(user);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
