import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MicroserviceExceptionFilter, ServicePort } from '@chidi-food-delivery/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.TCP,
      options: {
        port: ServicePort.USER_SERVICE,
      },
    },
  );

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
  console.log(`User Service is listening on TCP port ${ServicePort.USER_SERVICE}`);
}
bootstrap();
