import { ServiceName, TokenPayload } from '@chidi-food-delivery/common';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RiderJwtStrategy extends PassportStrategy(Strategy, 'rider-jwt') {
  constructor(
    @Inject(ServiceName.RIDER_SERVICE)
    private readonly riderServiceClient: ClientProxy,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate({ userId }: TokenPayload) {
    try {
      const response = await firstValueFrom(
        this.riderServiceClient.send(
          MessagePatterns.RIDER_SERVICE.GET_RIDER_PROFILE,
          userId,
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
