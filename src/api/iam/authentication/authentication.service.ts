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

export interface SignInResponse {
  accessToken: string;
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
    } catch (err) {
      if (err.code === QueryErrorCodes.PG_UNIQUE_VIOLATION_ERROR) {
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

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        audience: this.configService.get('JWT_TOKEN_AUDIENCE'),
        issuer: this.configService.get('JWT_TOKEN_ISSUER'),
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_TTL'),
      },
    );
    return { accessToken };
  }
}
