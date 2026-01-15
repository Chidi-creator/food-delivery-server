import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { ServicePort } from '@chidi-food-delivery/common';

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);
  await app.listen(ServicePort.ORDER_SERVICE);
  console.log(`Order Service is listening on port ${ServicePort.ORDER_SERVICE}`);
}
bootstrap();
