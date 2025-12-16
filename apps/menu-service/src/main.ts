import { NestFactory } from '@nestjs/core';
import { MenuServiceModule } from './menu-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MenuServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
