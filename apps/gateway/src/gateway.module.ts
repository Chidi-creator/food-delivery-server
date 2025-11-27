import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceName } from '@chidi-food-delivery/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ServiceName.USER_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 3001,
        },
      },
      {
        name: ServiceName.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 3002,
        },
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
