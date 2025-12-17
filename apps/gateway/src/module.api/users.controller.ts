import { CreateUserDto, ServiceName } from '@chidi-food-delivery/common';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(ServiceName.USER_SERVICE)
    private readonly userServiceClient: ClientProxy,
    @Inject(ServiceName.VENDOR_SERVICE)
    private readonly vendorServiceClient: ClientProxy,
  ) {}
  @Post('register')
  async registerUser(@Body() body: CreateUserDto) {
    return await firstValueFrom(
      this.userServiceClient.send({ cmd: 'register_user' }, body),
    );
  }

  @Get('vendor/:vendorId')
  async getVendorById(@Param('vendorId') vendorId: string) {
    return await firstValueFrom(
      this.vendorServiceClient.send(
        MessagePatterns.VENDOR_SERVICE.GET_VENDOR_BY_ID,
        vendorId,
      ),
    );
  }
}
