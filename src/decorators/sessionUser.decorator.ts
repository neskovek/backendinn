import { createParamDecorator } from '@nestjs/common';
import { SessionUser as SessionUserType } from '../interfaces/session';

export const SessionUser = createParamDecorator((data, ctx) => {
  return ctx.switchToHttp().getRequest<Request & { user?: SessionUserType }>()
    .user;
});
