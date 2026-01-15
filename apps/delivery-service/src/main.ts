import { NestFactory } from '@nestjs/core';
import { DeliveryServiceModule } from './delivery-service.module';
import { ServicePort } from '@chidi-food-delivery/common';

async function bootstrap() {
  const app = await NestFactory.create(DeliveryServiceModule);
  await app.listen(ServicePort.DELIVERY_SERVICE);
  console.log(`Delivery Service is listening on port ${ServicePort.DELIVERY_SERVICE}`);
}
bootstrap();
