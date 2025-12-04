import { TokenPayload, User } from '@chidi-food-delivery/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User): Promise<{ user: User; accessToken: string }> {
    try {
      const payload: TokenPayload = {
        userId: user._id as any,
      };

      const accessToken = this.jwtService.sign(payload);

      return { user, accessToken };
    } catch (error) {
      throw error;
    }
  }
}
