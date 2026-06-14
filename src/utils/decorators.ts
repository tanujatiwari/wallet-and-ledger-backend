import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface JwtUser {
  id: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    return data ? user?.[data as keyof JwtUser] : user;
  },
);
