import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceName } from '@chidi-food-delivery/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './module.api/auth.controller';
import { AuthService } from './module.api/auth.service';
import { UsersController } from './module.api/users.controller';
import { UserLocalStrategy } from './auth/strategies/local.strategy';
import { UsersJwtStratey } from './auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/gateway/.env.example',
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';
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
  controllers: [ AuthController, UsersController],
  providers: [ AuthService, UserLocalStrategy, UsersJwtStratey],
})
export class GatewayModule {}
