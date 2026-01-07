import {
  CurrentUser,
  Roles,
  ServiceName,
  User,
  UserRole,
} from '@chidi-food-delivery/common';
import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateVendorDto } from '@chidi-food-delivery/common/dto/vendor-dto';
import { firstValueFrom } from 'rxjs';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';

import { VendorJwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/roles.guard';

@Controller('vendors')
export class VendorController {
  constructor(
    @Inject(ServiceName.VENDOR_SERVICE)
    private readonly vendorServiceClient: ClientProxy,
  ) {}

  @Roles(UserRole.CUSTOMER)
  @UseGuards(VendorJwtAuthGuard, RoleGuard)
  @Post('register')
  async registerVendor(
    @CurrentUser() user: User,
    @Body() body: CreateVendorDto,
  ) {
    const userId = user._id.toString();
    body.userId = userId;

    return await firstValueFrom(
      this.vendorServiceClient.send(
        MessagePatterns.VENDOR_SERVICE.CREATE_VENDOR,
        body,
      ),
    );
  }

  @Roles(UserRole.VENDOR)
  @UseGuards(VendorJwtAuthGuard, RoleGuard)
  @Get('profile')
  async getUserVendorProfile(@CurrentUser() user: User) {
    const userId = user._id.toString();

    return await firstValueFrom(
      this.vendorServiceClient.send(
        MessagePatterns.VENDOR_SERVICE.GET_VENDOR_BY_USER_ID,
        userId,
      ),
    );
  }
}
