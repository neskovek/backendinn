import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ErrorMessages } from '../constants/error-messages.constant';
import { UserRole } from '../models/user.entity';
import { SessionUser as UserSessionType } from '../interfaces/session';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: UserSessionType }>();

    if (request.user?.role !== UserRole.ADMIN)
      throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);
    return true;
  }
}
