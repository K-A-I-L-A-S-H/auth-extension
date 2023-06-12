export interface ActiveUserData {
  sub: string;
  email: string;
  role: string;
  permissions: PermissionType[];
}

export interface RefreshTokenPayload {
  refreshTokenId: string;
}

export enum UserRoles {
  admin = 'admin',
  regular = 'regular',
}

export enum CoffeesPermission {
  CreateCoffee = 'CreateCoffee',
  UpdateCoffee = 'UpdateCoffee',
  DeleteCoffee = 'DeleteCoffee',
}

export type PermissionType = CoffeesPermission;

export interface Policy {
  [key: string]: any;
  name: string;
}

export interface PolicyHandler<T extends Policy> {
  handler(policy: T, user: ActiveUserData): Promise<void>;
}
