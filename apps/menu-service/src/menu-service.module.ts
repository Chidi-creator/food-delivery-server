import { Module } from '@nestjs/common';
import { MenuServiceController } from './menu-service.controller';
import { MenuServiceService } from './menu-service.service';

@Module({
  imports: [],
  controllers: [MenuServiceController],
  providers: [MenuServiceService],
})
export class MenuServiceModule {}
