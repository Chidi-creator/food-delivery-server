import { Controller, Get } from '@nestjs/common';
import { VendorServiceService } from './vendor-service.service';

@Controller()
export class VendorServiceController {
  constructor(private readonly vendorServiceService: VendorServiceService) {}

  @Get()
  getHello(): string {
    return this.vendorServiceService.getHello();
  }
}
