import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MicroserviceExceptionFilter } from '@chidi-food-delivery/common/filters/microservice-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    },
  );

  app.useGlobalFilters(new MicroserviceExceptionFilter());

  await app.listen();
  console.log('User Service is listening on TCP port 3001');
}
bootstrap();
