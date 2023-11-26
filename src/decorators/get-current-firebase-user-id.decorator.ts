import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

export const GetCurrentFirebaseUser = createParamDecorator(
  (_: undefined, context: ExecutionContext): DecodedIdToken => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as DecodedIdToken;
    return user;
  },
);
