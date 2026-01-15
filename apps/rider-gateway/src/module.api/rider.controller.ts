import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  Rider,
  ServiceName,
  UpdateRiderLocationDto,
  UpdateRiderProfileDto,
  UserRole,
  Roles,
  CreateRiderDto,
} from '@chidi-food-delivery/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { ClientProxy } from '@nestjs/microservices';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';
import { firstValueFrom } from 'rxjs';

@Controller('riders')
export class RiderController {
  constructor(
    @Inject(ServiceName.RIDER_SERVICE)
    private readonly riderServiceClient: ClientProxy,
  ) {}
  @Post()
  async registerRider(@Body() data: CreateRiderDto) {
    return await firstValueFrom(
      this.riderServiceClient.send(
        MessagePatterns.RIDER_SERVICE.CREATE_RIDER,
        data,
      ),
    );
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.DRIVER)
  @Get('profile')
  async getProfile(@CurrentUser() rider: Rider) {
    return await firstValueFrom(
      this.riderServiceClient.send(
        MessagePatterns.RIDER_SERVICE.GET_RIDER_PROFILE,
        rider._id,
      ),
    );
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.DRIVER)
  @Patch('location')
  async updateLocation(
    @CurrentUser() rider: Rider,
    @Body() locationData: UpdateRiderLocationDto,
  ) {
    return await firstValueFrom(
      this.riderServiceClient.send(
        MessagePatterns.RIDER_SERVICE.UPDATE_RIDER_LOCATION,
        { riderId: rider._id.toString(), locationData },
      ),
    );
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.DRIVER)
  @Patch('profile')
  async updateProfile(
    @CurrentUser() rider: Rider,
    @Body() profileData: UpdateRiderProfileDto,
  ) {
    return await firstValueFrom(
      this.riderServiceClient.send(
        MessagePatterns.RIDER_SERVICE.UPDATE_RIDER_PROFILE,
        { riderId: rider._id.toString(), profileData },
      ),
    );
  }

  @Get('available')
  async getAvailableRiders() {
    return await firstValueFrom(
      this.riderServiceClient.send(
        MessagePatterns.RIDER_SERVICE.GET_AVAILABLE_RIDERS,
        {},
      ),
    );
  }
}
