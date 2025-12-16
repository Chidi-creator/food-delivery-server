import { CurrentUser, ServiceName, User } from '@chidi-food-delivery/common';
import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateVendorDto } from '@chidi-food-delivery/common/dto/vendor-dto';
import { firstValueFrom } from 'rxjs';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';

@UseGuards(JwtAuthGuard)
@Controller('vendors')
export class VendorsController {
  constructor(
    @Inject(ServiceName.VENDOR_SERVICE)
    private readonly vendorServiceClient: ClientProxy,
  ) {}

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
}
