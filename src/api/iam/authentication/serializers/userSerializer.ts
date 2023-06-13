import { PassportSerializer } from '@nestjs/passport';
import { ActiveUserData } from '../../types';

export class UserSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error, user: ActiveUserData) => void) {
    // @ts-expect-error
    done(null, {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });
  }

  deserializeUser(
    payload: ActiveUserData,
    done: (err: Error, user: ActiveUserData) => void,
  ) {
    // @ts-expect-error
    done(null, payload);
  }
}
