import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserName = createParamDecorator((data: never, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
