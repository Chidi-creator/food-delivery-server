import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { RiderGatewayModule } from './rider-gateway.module';
import { GatewayExceptionFilter, ServicePort } from '@chidi-food-delivery/common';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from '@chidi-food-delivery/common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(RiderGatewayModule);
  app.enableCors();

  const httpAdapter = app.get(HttpAdapterHost);
  
  // Add global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GatewayExceptionFilter(httpAdapter));

  await app.listen(ServicePort.RIDER_GATEWAY);
  console.log(`Rider Gateway is listening on port ${ServicePort.RIDER_GATEWAY}`);
}
bootstrap();
