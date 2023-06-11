import {
  BadRequestException,
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
import {
  ActiveUserData,
  PermissionType,
  RefreshTokenPayload,
  UserRoles,
} from '../types';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { Role, User } from '@prisma/client';
import { RefreshTokenIdsStorage } from './refreshTokenIds.storage';
import { randomUUID } from 'crypto';
import { InvalidateRefreshTokenError } from '@/lib/exceptions/invalidatedToken.exception';

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
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signup({ email, password, role = UserRoles.regular }: SignUpDto) {
    const hashPassword = await this.hashService.hash(password);

    const userRole = await this.getUserRole(role);

    try {
      await this.prisma.user.create({
        data: {
          email,
          name: email,
          password: hashPassword,
          roleId: userRole.id,
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

  async getUserRole(role: string): Promise<Role> {
    try {
      return this.prisma.role.findFirstOrThrow({
        where: {
          role,
        },
      });
    } catch (err) {
      throw new BadRequestException('Role is invalid');
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
    const refreshTokenId = randomUUID();

    const userPermissions = await this.prisma.userPermission.findMany({
      where: {
        userId: user.id,
      },
      select: {
        permissions: true,
      },
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.configService.get('JWT_ACCESS_TOKEN_TTL')!,
        {
          email: user.email,
          role: user.roleId,
          permissions: userPermissions.map(
            (p) => p.permissions.permission as PermissionType,
          ),
        },
      ),
      this.signToken<RefreshTokenPayload>(
        user.id,
        this.configService.get('JWT_REFRESH_TOKEN_TTL')!,
        { refreshTokenId },
      ),
    ]);

    await this.refreshTokenIdsStorage.insertToken(refreshTokenId, refreshToken);

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
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & RefreshTokenPayload
      >(token, {
        audience: this.configService.get('JWT_TOKEN_AUDIENCE'),
        issuer: this.configService.get('JWT_TOKEN_ISSUER'),
        secret: this.configService.get('JWT_SECRET'),
      });

      const isValid = await this.refreshTokenIdsStorage.validateToken(
        refreshTokenId,
        token,
      );

      if (isValid) {
        await this.refreshTokenIdsStorage.invalidateToken(refreshTokenId);
      } else {
        throw new UnauthorizedException('Refresh token is invalid');
      }

      const user = await this.prisma.user.findFirstOrThrow({
        where: { id: sub },
      });

      return this.generateTokens(user);
    } catch (err) {
      let message = '';
      if (err instanceof InvalidateRefreshTokenError) {
        // @TODO: Notify user that their access credentials have been compromised
        message = 'Access Denied';
      }
      throw new UnauthorizedException(message);
    }
  }
}
