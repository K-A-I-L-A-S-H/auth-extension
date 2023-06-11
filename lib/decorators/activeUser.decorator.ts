import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { REQUEST_USER_KEY } from '@/lib/constants';
import { ActiveUserData } from '@/src/api/iam/types';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: ActiveUserData | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
