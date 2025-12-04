import { Controller, Post, UseGuards } from '@nestjs/common';
import { LocalGuard } from '../auth/guards/local.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@chidi-food-delivery/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(LocalGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
  ): Promise<{ user: User; accessToken: string }> {
    return this.authService.login(user);
  }
}
