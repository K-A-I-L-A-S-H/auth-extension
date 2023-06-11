import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_USER_KEY, ROLES_KEY } from '../constants';
import { PrismaService } from '../prisma';
import { ActiveUserData, UserRoles } from '@/src/api/iam/types';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextRoles = this.reflector.getAllAndOverride<UserRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!contextRoles) {
      return true;
    }

    const user: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];
    const userRole = await this.prisma.role.findFirst({
      where: {
        id: user.role,
      },
    });

    if (!userRole) {
      return false;
    }

    return contextRoles.some((role) => role === userRole.role);
  }
}
