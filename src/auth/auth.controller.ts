import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { SignUpAuthDto } from './dto/signup-auth.dto';

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
}
