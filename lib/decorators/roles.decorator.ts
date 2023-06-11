import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants';
import { UserRoles } from '@/src/api/iam/types';

export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
