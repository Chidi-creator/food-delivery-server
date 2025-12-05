import { Test, TestingModule } from '@nestjs/testing';
import { VendorServiceController } from './vendor-service.controller';
import { VendorServiceService } from './vendor-service.service';

describe('VendorServiceController', () => {
  let vendorServiceController: VendorServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VendorServiceController],
      providers: [VendorServiceService],
    }).compile();

    vendorServiceController = app.get<VendorServiceController>(VendorServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(vendorServiceController.getHello()).toBe('Hello World!');
    });
  });
});
