import { Module } from '@nestjs/common';
import { VendorServiceController } from './vendor-service.controller';
import { VendorServiceService } from './vendor-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Vendor,
  VendorSchema,
} from '@chidi-food-delivery/common/schemas/vendor.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceName } from '@chidi-food-delivery/common';
import { VendorsRepository } from './vendor.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/vendor-service/.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),

    ClientsModule.register([
      {
        name: ServiceName.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 3002,
        },
      },
      {
        name: ServiceName.USER_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 3001,
        },
      }
    ]),
  ],

  controllers: [VendorServiceController],
  providers: [VendorServiceService, VendorsRepository],
})
export class VendorServiceModule {}
