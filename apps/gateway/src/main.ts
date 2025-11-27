import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { GatewayExceptionFilter } from '@chidi-food-delivery/common/filters/gateway-exception.filter';
import { LoggingInterceptor } from '@chidi-food-delivery/common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
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

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
