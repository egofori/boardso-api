import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { SignUpAuthDto } from './dto/signup-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt.guard';
import { GetCurrentUserId } from '@/decorators/get-current-user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('local/sign-up')
  signUp(@Body() dto: SignUpAuthDto) {
    return this.authService.signUpLocal(dto);
  }

  @Post('local/sign-in')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: SignInAuthDto) {
    return this.authService.signInLocal(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @GetCurrentUserId() userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }
}
