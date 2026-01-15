import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RiderServiceService } from './rider-service.service';
import {
  CreateRiderDto,
  LoginRiderDto,
  UpdateRiderLocationDto,
  UpdateRiderStatusDto,
  UpdateRiderProfileDto,
  Rider,
} from '@chidi-food-delivery/common';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';
import { Types } from 'mongoose';

@Controller()
export class RiderServiceController {
  private readonly logger = new Logger(RiderServiceController.name);

  constructor(private readonly riderServiceService: RiderServiceService) {}

  @MessagePattern(MessagePatterns.RIDER_SERVICE.CREATE_RIDER)
  async createRider(@Payload() createRiderDto: CreateRiderDto) {
    try {
      this.logger.log('Creating new rider');
      const result = await this.riderServiceService.createRider(createRiderDto);
      
      return {
        success: true,
        message: 'Rider created successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Rider service registration error:', error);
      throw error;
    }
  }

  @MessagePattern(MessagePatterns.RIDER_SERVICE.VALIDATE_RIDER)
  async validateRider(@Payload() loginRiderDto: LoginRiderDto) {
    try {
      this.logger.log(`Validating rider: ${loginRiderDto.identifier}`);
      const result = await this.riderServiceService.validateRider(loginRiderDto);
      
      return {
        success: true,
        message: 'Rider validated successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Rider validation error:', error);
      throw error;
    }
  }

  @MessagePattern(MessagePatterns.RIDER_SERVICE.GET_RIDER_BY_ID)
  async getRiderById(@Payload() riderId: string) {
    try {
      this.logger.log(`Getting rider by ID: ${riderId}`);
      const result = await this.riderServiceService.getRiderById(new Types.ObjectId(riderId));
      
      return {
        success: true,
        message: 'Rider retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Get rider by ID error:', error);
      throw error;
    }
  }

  @MessagePattern(MessagePatterns.RIDER_SERVICE.GET_RIDER_PROFILE)
  async getRiderProfile(@Payload() riderId: string) {
    try {
      this.logger.log(`Getting rider profile: ${riderId}`);
      const result = await this.riderServiceService.getRiderProfile(riderId);
      
      return {
        success: true,
        message: 'Rider profile retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Get rider profile error:', error);
      throw error;
    }
  }

  @MessagePattern(MessagePatterns.RIDER_SERVICE.UPDATE_RIDER_STATUS)
  async updateRiderStatus(
    @Payload() data: { riderId: string; statusData: UpdateRiderStatusDto },
  ) {
    try {
      this.logger.log(`Updating rider status: ${data.riderId}`);
      const result = await this.riderServiceService.updateRiderStatus(
        data.riderId,
        data.statusData,
      );
      
      return {
        success: true,
        message: 'Rider status updated successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Update rider status error:', error);
      throw error;
    }
  }

  @MessagePattern(MessagePatterns.RIDER_SERVICE.UPDATE_RIDER_LOCATION)
  async updateRiderLocation(
    @Payload() data: { riderId: string; locationData: UpdateRiderLocationDto },
  ) {
    try {
      this.logger.log(`Updating rider location: ${data.riderId}`);
      const result = await this.riderServiceService.updateRiderLocation(
        data.riderId,
        data.locationData,
      );
      
      return {
        success: true,
        message: 'Rider location updated successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Update rider location error:', error);
      throw error;
    }
  }

  @MessagePattern(MessagePatterns.RIDER_SERVICE.UPDATE_RIDER_PROFILE)
  async updateRiderProfile(
    @Payload() data: { riderId: string; profileData: UpdateRiderProfileDto },
  ) {
    try {
      this.logger.log(`Updating rider profile: ${data.riderId}`);
      const result = await this.riderServiceService.updateRiderProfile(
        data.riderId,
        data.profileData,
      );
      
      return {
        success: true,
        message: 'Rider profile updated successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Update rider profile error:', error);
      throw error;
    }
  }

  @MessagePattern(MessagePatterns.RIDER_SERVICE.GET_AVAILABLE_RIDERS)
  async getAvailableRiders() {
    try {
      this.logger.log('Getting available riders');
      const result = await this.riderServiceService.getAvailableRiders();
      
      return {
        success: true,
        message: 'Available riders retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Get available riders error:', error);
      throw error;
    }
  }

  @MessagePattern(MessagePatterns.RIDER_SERVICE.GET_NEARBY_RIDERS)
  async getNearbyRiders(
    @Payload() data: { latitude: number; longitude: number; maxDistance?: number },
  ) {
    try {
      this.logger.log(`Getting nearby riders for location: ${data.latitude}, ${data.longitude}`);
      const result = await this.riderServiceService.getNearbyRiders(
        data.latitude,
        data.longitude,
        data.maxDistance,
      );
      
      return {
        success: true,
        message: 'Nearby riders retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Get nearby riders error:', error);
      throw error;
    }
  }
}

