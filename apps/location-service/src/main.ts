import { NestFactory } from '@nestjs/core';
import { LocationServiceModule } from './location-service.module';
import { ServicePort } from '@chidi-food-delivery/common';

async function bootstrap() {
  const app = await NestFactory.create(LocationServiceModule);
  await app.listen(ServicePort.LOCATION_SERVICE);
  console.log(`Location Service is listening on port ${ServicePort.LOCATION_SERVICE}`);
}
bootstrap();
