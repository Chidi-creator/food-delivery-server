import { Module } from '@nestjs/common';
import { VendorServiceController } from './vendor-service.controller';
import { VendorServiceService } from './vendor-service.service';

@Module({
  imports: [],
  controllers: [VendorServiceController],
  providers: [VendorServiceService],
})
export class VendorServiceModule {}
