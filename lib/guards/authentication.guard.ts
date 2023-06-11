import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './accessToken.guard';
import { AuthType } from '@/src/constants';
import { AUTH_TYPE_KEY } from '../constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeGuardMap: Record<AuthType, CanActivate | CanActivate[]> = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };

    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];
    const guards = authTypes.map((type) => authTypeGuardMap[type]).flat();

    let error = new UnauthorizedException();

    for (const guard of guards) {
      const canActivate = await Promise.resolve(
        guard.canActivate(context),
      ).catch((err) => {
        error = err;
      });

      if (canActivate) {
        return true;
      }
    }

    throw error;
  }
}
