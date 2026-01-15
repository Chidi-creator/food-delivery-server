import { NestFactory } from '@nestjs/core';
import { RiderServiceModule } from './rider-service.module';
import { ServicePort, MicroserviceExceptionFilter } from '@chidi-food-delivery/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RiderServiceModule,
    {
      transport: Transport.TCP,
      options: {
        port: ServicePort.RIDER_SERVICE,
      },
    },
  );

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
  console.log(`Rider Service is listening on TCP port ${ServicePort.RIDER_SERVICE}`);
}
bootstrap();
