import { LoginRiderDto, ServiceName } from '@chidi-food-delivery/common';
import { ValidationException } from '@chidi-food-delivery/common/exceptions/rpc.exceptions';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class RiderLocalStrategy extends PassportStrategy(Strategy, 'rider-local') {
  constructor(
    @Inject(ServiceName.RIDER_SERVICE)
    private readonly riderServiceClient: ClientProxy,
  ) {
    super({
      usernameField: 'identifier',
      passwordField: 'password',
    });
  }

  async validate(identifier: string, password: string): Promise<any> {
    const data: LoginRiderDto = { identifier, password };

    const response = await firstValueFrom(
      this.riderServiceClient
        .send(MessagePatterns.RIDER_SERVICE.VALIDATE_RIDER, data)
        .pipe(timeout(5000)),
    );

    if (!response || !response.data || response.success === false) {
      throw new ValidationException('Invalid credentials provided.');
    }

    // Return only the rider data, not the entire response
    return response.data;
  }
}
