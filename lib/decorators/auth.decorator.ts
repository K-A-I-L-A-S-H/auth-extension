import { AuthType } from '@/src/constants';
import { SetMetadata } from '@nestjs/common';
import { AUTH_TYPE_KEY } from '../constants';

export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
