import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from '../auth/guards/local.guard';
import { CurrentUser, Rider, CreateRiderDto } from '@chidi-food-delivery/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createRiderDto: CreateRiderDto) {
    return await this.authService.register(createRiderDto);
  }

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@CurrentUser() rider: Rider) {
    return this.authService.login(rider);
  }
}
