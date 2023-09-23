import { Module } from '@nestjs/common';
import { UserContactsService } from './user-contacts.service';
import { UserContactsController } from './user-contacts.controller';
import { JWTStrategy } from '@/auth/jwt.strategy';

@Module({
  controllers: [UserContactsController],
  providers: [UserContactsService, JWTStrategy],
})
export class UserContactsModule {}
