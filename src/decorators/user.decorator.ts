import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const GetUser = createParamDecorator(
  (
    data: keyof User | undefined,
    ctx: ExecutionContext,
  ): User | User[keyof User] | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
