import { CreateUserDto, ServiceName } from '@chidi-food-delivery/common';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(ServiceName.USER_SERVICE)
    private readonly userServiceClient: ClientProxy,
  ) {}
  @Post('register')
  async registerUser(@Body() body: CreateUserDto) {
    return await firstValueFrom(
      this.userServiceClient.send({ cmd: 'register_user' }, body),
    );
  }
}
