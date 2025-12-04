import { ServiceName, TokenPayload } from '@chidi-food-delivery/common';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersJwtStratey extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(ServiceName.USER_SERVICE)
    private readonly userServiceClient: ClientProxy,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate({ userId }: TokenPayload) {
    try {
      const profile = await firstValueFrom(
        this.userServiceClient.send({ cmd: 'user_profile' }, userId),
      );
      return profile;
    } catch (error) {
      throw error;
    }
  }
}
