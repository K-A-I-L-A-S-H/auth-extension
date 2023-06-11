export interface ActiveUserData {
  sub: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  refreshTokenId: string;
}

export enum UserRoles {
  admin = 'admin',
  regular = 'regular',
}
