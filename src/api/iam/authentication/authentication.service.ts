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

@Injectable()
export class AuthenticationService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashingService,
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

  async signin({ email, password }: SignInDto): Promise<boolean> {
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
    console.log({ isValidPassword });
    if (!isValidPassword) {
      throw new UnauthorizedException('Password in incorrect');
    }

    return true;
  }
}
