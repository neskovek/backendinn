import { UserRole } from '../models/user.entity';

export interface SessionUser {
  sub: string;
  role: UserRole;
  email?: string;
  iat?: number;
  exp?: number;
}
