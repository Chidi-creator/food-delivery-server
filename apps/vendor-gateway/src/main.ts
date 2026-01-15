import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { VendorGatewayModule } from './vendor-gateway.module';
import {
  GatewayExceptionFilter,
  LoggingInterceptor,
  ServicePort,
} from '@chidi-food-delivery/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(VendorGatewayModule);
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

  await app.listen(ServicePort.VENDOR_GATEWAY);
  console.log(`Vendor Gateway is listening on port ${ServicePort.VENDOR_GATEWAY}`);
}
bootstrap();
