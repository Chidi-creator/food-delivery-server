import { Module } from '@nestjs/common';
import { RiderServiceController } from './rider-service.controller';
import { RiderServiceService } from './rider-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceName, ServicePort, Rider, RiderSchema } from '@chidi-food-delivery/common';
import { RiderRepository } from './rider.repostory';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/rider-service/.env.example',
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService): MongooseModuleOptions => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Rider.name, schema: RiderSchema }]),
    ClientsModule.register([
      {
        name: ServiceName.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          port: ServicePort.NOTIFICATION_SERVICE,
        },
      },
    ]),
  ],
  controllers: [RiderServiceController],
  providers: [RiderServiceService, RiderRepository],
})
export class RiderServiceModule {}

