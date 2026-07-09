import { Body, Controller, Post } from '@nestjs/common';
import { AuthService }   from './auth.service';

@Controller('auth')
export class AuthController {
constructor(private readonly AuthService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.AuthService.validateUser(body.email, body.password);
    return this.AuthService.login(user);
  }
}
