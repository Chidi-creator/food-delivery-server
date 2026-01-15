import { NestFactory } from '@nestjs/core';
import { MenuServiceModule } from './menu-service.module';
import { ServicePort } from '@chidi-food-delivery/common';

async function bootstrap() {
  const app = await NestFactory.create(MenuServiceModule);
  await app.listen(ServicePort.MENU_SERVICE);
  console.log(`Menu Service is listening on port ${ServicePort.MENU_SERVICE}`);
}
bootstrap();
