import { firebaseAuth } from '@/utils/firebase';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-firebase-jwt';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  Strategy,
  'firebase-jwt',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
      secretOrKey: config.get<string>('FIREBASE_JWT_SECRET'),
    });
  }

  async validate(token: any) {
    return await firebaseAuth.verifyIdToken(token, true).catch(() => {
      throw new UnauthorizedException();
    });
  }
}
