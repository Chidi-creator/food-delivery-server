import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceName } from '@chidi-food-delivery/common';
import { VendorController } from './module.api/vendor.controller';
import { VendorJwtStrategy } from './auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/vendor-gateway/.env.example',
    }),
    PassportModule,
      JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1d';
            return {
              secret:
                configService.get<string>('JWT_SECRET') || 'default-secret-key',
              signOptions: {
                expiresIn: expiresIn as any,
              },
            };
          },
          inject: [ConfigService],
        }),
        ClientsModule.register([
          {
            name: ServiceName.VENDOR_SERVICE,
            transport: Transport.TCP,
            options: {
              port: 3003,
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
  controllers: [VendorController],
  providers: [VendorJwtStrategy],
})
export class VendorGatewayModule {}
