import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import type { Login, Register } from '../interfaces/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: Register) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: Login) {
    return this.authService.login(dto.email, dto.password);
  }
}
