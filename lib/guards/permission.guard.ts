import { ActiveUserData, PermissionType } from '@/src/api/iam/types';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, REQUEST_USER_KEY } from '../constants';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride<
      PermissionType[]
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);
    if (!contextPermissions) {
      return true;
    }

    const user: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];

    return contextPermissions.every((permission) =>
      user.permissions?.includes(permission),
    );
  }
}
