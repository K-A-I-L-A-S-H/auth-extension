import { Injectable } from '@nestjs/common';
import { ActiveUserData, PolicyHandler } from '../../types';
import { FrameworkContributorPolicy } from './frameworkContributor.policy';
import { PolicyHandlerStorage } from '../policyHandler.storage';
import { DOMAIN_NAME } from '@/src/constants';

@Injectable()
export class FrameworkContributorPolicyHandler
  implements PolicyHandler<FrameworkContributorPolicy>
{
  constructor(private readonly policyHandlerStorage: PolicyHandlerStorage) {
    this.policyHandlerStorage.add(FrameworkContributorPolicy, this);
  }

  async handler(
    policy: FrameworkContributorPolicy,
    user: ActiveUserData,
  ): Promise<void> {
    const isContributor = user.email.endsWith(DOMAIN_NAME);
    if (!isContributor) {
      throw new Error('User is not a contributor');
    }

    return Promise.resolve();
  }
}
