import { createParamDecorator } from "@nestjs/common";

export const SessionUser = createParamDecorator((data, ctx) => {
  return ctx.switchToHttp().getRequest().user;
});