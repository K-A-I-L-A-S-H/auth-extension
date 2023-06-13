import { PrismaService } from '@/lib/prisma';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/signIn.dto';
import { User } from '@prisma/client';

@Injectable()
export class SessionAuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  async signin({ email, password }: SignInDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    const isValidPassword = await this.hashingService.compare(
      password,
      user.password!,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return user;
  }
}
