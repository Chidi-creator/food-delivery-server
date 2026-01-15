import { Test, TestingModule } from '@nestjs/testing';
import { RiderGatewayController } from './rider-gateway.controller';
import { RiderGatewayService } from './rider-gateway.service';

describe('RiderGatewayController', () => {
  let riderGatewayController: RiderGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RiderGatewayController],
      providers: [RiderGatewayService],
    }).compile();

    riderGatewayController = app.get<RiderGatewayController>(RiderGatewayController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(riderGatewayController.getHello()).toBe('Hello World!');
    });
  });
});
