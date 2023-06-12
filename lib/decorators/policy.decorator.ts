import { Policy } from '@/src/api/iam/types';
import { SetMetadata } from '@nestjs/common';
import { POLICY_KEY } from '../constants';

export const Policies = (...policies: Policy[]) =>
  SetMetadata(POLICY_KEY, policies);
