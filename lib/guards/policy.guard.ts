import { ActiveUserData, Policy } from '@/src/api/iam/types';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { POLICY_KEY, REQUEST_USER_KEY } from '../constants';
import { PolicyHandlerStorage } from '@/src/api/iam/policyHandler/policyHandler.storage';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly policyHandlerStorage: PolicyHandlerStorage,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextPolicies = this.reflector.getAllAndOverride<Policy[]>(
      POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );
    console.log({ contextPolicies });

    if (contextPolicies) {
      const user: ActiveUserData = context.switchToHttp().getRequest()[
        REQUEST_USER_KEY
      ];
      await Promise.all(contextPolicies.map(policy => {
        console.log(typeof (policy.constructor as Type));
        const policyHandler = this.policyHandlerStorage.get(policy.costructor as Type);
        return policyHandler?.handler(policy, user);
      })).catch((err) => {
        throw new ForbiddenException(err.message);
      });
    }

    return true;
  }
}
