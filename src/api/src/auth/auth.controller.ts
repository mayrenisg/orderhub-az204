import { Body, Controller, Post } from '@nestjs/common';
import { AuthService }   from './auth.service';

@Controller('auth')
export class AuthController {
constructor(private readonly AuthService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.AuthService.login(body.email, body.password);
  }
}
