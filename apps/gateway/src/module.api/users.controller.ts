import { CreateUserDto, Roles, ServiceName, UserRole } from '@chidi-food-delivery/common';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';
import { Body, Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';

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
      this.userServiceClient.send(MessagePatterns.USER_SERVICE.REGISTER_USER, body),
    );
  }
  @Roles(UserRole.CUSTOMER, UserRole.VENDOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
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
