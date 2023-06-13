import { ApiKeysService } from '@/src/api/iam/apiKeys/apiKeys.service';
import { AuthType } from '@/src/constants';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma';
import { REQUEST_USER_KEY } from '../constants';
import { ActiveUserData } from '@/src/api/iam/types';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeysService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractKeyFromHeader(request);
    if (!apiKey) {
      throw new UnauthorizedException('Invalid Api Key');
    }

    const apiKeyId = this.apiKeyService.extractIdFromApiKey(apiKey);
    try {
      const apiKeyData = await this.prisma.apiKey.findFirstOrThrow({
        where: { id: apiKeyId },
        select: {
          key: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      await this.apiKeyService.validate(apiKey, apiKeyData.key);

      const permissions = await this.prisma.userPermission.findMany({
        where: { userId: apiKeyData.user.id },
        select: {
          permissions: true,
        },
      });

      request[REQUEST_USER_KEY] = {
        sub: apiKeyData.user.id,
        email: apiKeyData.user.email,
        permissions: permissions.map((p) => p.permissions.permission).flat(),
        role: apiKeyData.user.role.role,
      } as ActiveUserData;
    } catch (err) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractKeyFromHeader(request: Request): string | undefined {
    const [type, key] = request.headers.authorization?.split(' ') ?? [];
    return type === AuthType.ApiKey ? key : undefined;
  }
}
