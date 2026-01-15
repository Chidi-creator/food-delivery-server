import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ServicePort } from '@chidi-food-delivery/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    {
      transport: Transport.TCP,
      options: {
        port: ServicePort.NOTIFICATION_SERVICE,
      },
    },
  );
  app.listen();
  console.log(`Notification Service is listening on TCP port ${ServicePort.NOTIFICATION_SERVICE}`);
}
bootstrap();
