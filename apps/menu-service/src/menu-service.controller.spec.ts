import { Test, TestingModule } from '@nestjs/testing';
import { MenuServiceController } from './menu-service.controller';
import { MenuServiceService } from './menu-service.service';

describe('MenuServiceController', () => {
  let menuServiceController: MenuServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MenuServiceController],
      providers: [MenuServiceService],
    }).compile();

    menuServiceController = app.get<MenuServiceController>(MenuServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(menuServiceController.getHello()).toBe('Hello World!');
    });
  });
});
