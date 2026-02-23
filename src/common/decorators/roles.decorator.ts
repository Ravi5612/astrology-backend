import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'handler-roles';
export type DEFAULT_ROLES = 'admin' | 'user' | 'agent';

export const Roles = (...roles: DEFAULT_ROLES[]) =>
  SetMetadata(ROLES_KEY, roles);
