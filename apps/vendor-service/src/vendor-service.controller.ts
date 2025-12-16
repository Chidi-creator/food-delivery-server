import { Controller, Get } from '@nestjs/common';
import { VendorServiceService } from './vendor-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';
import { Types } from 'mongoose';

@Controller()
export class VendorServiceController {
  constructor(private readonly vendorServiceService: VendorServiceService) {}

  @Get()
  getHello(): string {
    return this.vendorServiceService.getHello();
  }

  @MessagePattern(MessagePatterns.VENDOR_SERVICE.CREATE_VENDOR)
  async createVendor(@Payload() data: any) {
    const vendor = this.vendorServiceService.createVendor(data);
    return {
      success: true,
      message: 'Vendor created successfully',
      data: vendor,
    };
  }

  @MessagePattern(MessagePatterns.VENDOR_SERVICE.GET_VENDOR_BY_USER_ID)
  async getVendorByUserId(@Payload() userId: string) {
    const vendor = this.vendorServiceService.getVendorByUserId(
      new Types.ObjectId(userId),
    );

    return {
      success: true,
      message: 'Vendor retrieved successfully',
      data: vendor,
    };
  }
}
