import { LoginUserDto, ServiceName } from '@chidi-food-delivery/common';
import { ValidationException } from '@chidi-food-delivery/common/exceptions/rpc.exceptions';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class UserLocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @Inject(ServiceName.USER_SERVICE)
    private readonly userServiceClient: ClientProxy,
  ) {
    super({
      usernameField: 'identifier',
      passwordField: 'password',
    });
  }

  async validate(identifier: string, password: string): Promise<any> {
    const data: LoginUserDto = { identifier, password };

    const response = await firstValueFrom(
      this.userServiceClient
        .send({ cmd: 'validate_user' }, data)
        .pipe(timeout(5000)),
    );

    if (!response || !response.data || response.success === false) {
      throw new ValidationException('Invalid credentials provided.');
    }

    // Return only the user data, not the entire response
    return response.data;
  }
}
