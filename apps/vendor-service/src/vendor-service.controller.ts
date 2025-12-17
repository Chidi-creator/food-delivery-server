import { Controller, Get } from '@nestjs/common';
import { VendorServiceService } from './vendor-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';
import { Types } from 'mongoose';
import { CreateVendorDto } from '@chidi-food-delivery/common/dto/vendor-dto';

@Controller()
export class VendorServiceController {
  constructor(private readonly vendorServiceService: VendorServiceService) {}

  @Get()
  getHello(): string {
    return this.vendorServiceService.getHello();
  }

  @MessagePattern(MessagePatterns.VENDOR_SERVICE.CREATE_VENDOR)
  async createVendor(@Payload() data: CreateVendorDto) {
    const vendor = await this.vendorServiceService.createVendor(data);
    return {
      success: true,
      message: 'Vendor created successfully',
      data: vendor,
    };
  }

  @MessagePattern(MessagePatterns.VENDOR_SERVICE.GET_VENDOR_BY_USER_ID)
  async getVendorByUserId(@Payload() userId: string) {
    const vendor = await this.vendorServiceService.getVendorByUserId(
      new Types.ObjectId(userId),
    );

    return {
      success: true,
      message: 'Vendor retrieved successfully',
      data: vendor,
    };
  }

  @MessagePattern(MessagePatterns.VENDOR_SERVICE.GET_VENDOR_BY_ID)
  async getVendorById(@Payload() vendorId: string) {
    const vendor = await this.vendorServiceService.getVendorById(
      new Types.ObjectId(vendorId),
    );

    return {
      success: true,
      message: 'Vendor retrieved successfully',
      data: vendor,
    };
  }
}