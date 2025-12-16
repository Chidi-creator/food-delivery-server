import { NestFactory } from '@nestjs/core';
import { VendorServiceModule } from './vendor-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MicroserviceExceptionFilter } from '@chidi-food-delivery/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    VendorServiceModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3003,
      },
    },
  );

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
  console.log('Vendor Service is listening on TCP port 3003');
}
bootstrap();
