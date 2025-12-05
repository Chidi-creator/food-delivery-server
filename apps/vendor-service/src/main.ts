import { NestFactory } from '@nestjs/core';
import { VendorServiceModule } from './vendor-service.module';

async function bootstrap() {
  const app = await NestFactory.create(VendorServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
