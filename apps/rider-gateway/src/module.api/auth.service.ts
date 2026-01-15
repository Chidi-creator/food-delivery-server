import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateRiderDto,
  Rider,
  ServiceName,
  TokenPayload,
} from '@chidi-food-delivery/common';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(ServiceName.RIDER_SERVICE)
    private readonly riderServiceClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async register(createRiderDto: CreateRiderDto) {
    const response = await firstValueFrom(
      this.riderServiceClient.send(
        MessagePatterns.RIDER_SERVICE.CREATE_RIDER,
        createRiderDto,
      ),
    );

    return { 
      success: response.success,
      message: response.message,
      data: response.data
    };
  }

  async login(rider: Rider) {
    try {
      const payload: TokenPayload = {
        userId: rider._id as any,
      };

      const accessToken = this.jwtService.sign(payload);

      return { 
        success: true,
        message: 'Login successful',
        data: {
          rider,
          accessToken
        }
      };
    } catch (error) {
      throw error;
    }
  }
}
