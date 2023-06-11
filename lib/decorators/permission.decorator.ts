import { SetMetadata } from '@nestjs/common';
import { PERMISSION_KEY } from '../constants';
import { PermissionType } from '@/src/api/iam/types';

export const Permissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
