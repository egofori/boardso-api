import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { JWTStrategy } from './jwt.strategy';
import { FirebaseAuthStrategy } from './firebase-auth.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule.register({ defaultStrategy: 'firebase-jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JWTStrategy, FirebaseAuthStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
