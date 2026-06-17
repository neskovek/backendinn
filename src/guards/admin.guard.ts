import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { ErrorMessages } from '../constants/error-messages.constant';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.user?.role !== 'admin')
      throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);
    return true;
  }
}
