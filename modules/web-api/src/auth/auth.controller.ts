import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import { Public } from './auth.public';
import { AuthService } from './auth.service';
import { TokenUserPayload } from './dto/auth.dto';
import { UserPayload } from './user/dto/user-request-payload.dto';
import { User } from './user/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: Record<string, any>) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @Get('profile')
  getProfile(@Request() req: Record<'user', any>): TokenUserPayload {
    return req.user;
  }

  @Post('logout')
  logout(@User() user: UserPayload) {
    return this.authService.logout(user.username);
  }
}
