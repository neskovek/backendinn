import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ErrorMessages } from '../constants/error-messages.constant';
import { SessionUser } from '../interfaces/session';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: SessionUser }>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token)
      throw new UnauthorizedException(ErrorMessages.MISSING_AUTH_TOKEN);

    try {
      request.user = this.jwtService.verify<SessionUser>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return true;
    } catch {
      throw new UnauthorizedException(ErrorMessages.INVALID_AUTH_TOKEN);
    }
  }
}
