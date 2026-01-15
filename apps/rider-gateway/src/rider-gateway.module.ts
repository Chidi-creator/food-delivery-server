import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceName, ServicePort } from '@chidi-food-delivery/common';
import { RiderJwtStrategy } from './auth/strategy/jwt.strategy';
import { RiderLocalStrategy } from './auth/strategy/local.strategy';
import { AuthController } from './module.api/auth.controller';
import { AuthService } from './module.api/auth.service';
import { RiderController } from './module.api/rider.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/rider-gateway/.env.example',
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
        name: ServiceName.RIDER_SERVICE,
        transport: Transport.TCP,
        options: {
          port: ServicePort.RIDER_SERVICE,
        },
      },
      {
        name: ServiceName.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          port: ServicePort.NOTIFICATION_SERVICE,
        },
      },
    ]),
  ],
  controllers: [AuthController, RiderController],
  providers: [AuthService, RiderJwtStrategy, RiderLocalStrategy],
})
export class RiderGatewayModule {}
