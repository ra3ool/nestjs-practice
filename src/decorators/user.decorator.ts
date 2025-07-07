import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Define the shape of the user object (adjust based on your actual user structure)
interface User {
  id: string;
  username: string;
  email: string;
  role: string; // Add specific fields as needed
}

// Extend the Request interface to include the user property
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
