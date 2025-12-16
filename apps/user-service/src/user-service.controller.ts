import { Controller, Get, Logger } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  CreateUserDto,
  CustomRpcException,
  LoginUserDto,
  ServiceName,
} from '@chidi-food-delivery/common';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';

@Controller()
export class UserServiceController {
  private readonly logger = new Logger(UserServiceController.name);
  constructor(
    private readonly userServiceService: UserServiceService,
  ) {}

  @Get('/healthcheck')
  getHealthCheck(): string {
    return 'User Service is up and running!';
  }

  @MessagePattern({ cmd: 'register_user' })
  async registerUser(@Payload() data: CreateUserDto) {
    try {
      const result = await this.userServiceService.createUser(data);
      
      return {
        success: true,
        message: 'User created successfully',
        data: result,
      };
    } catch (error) {
      console.error('User service registration error:', error);

      // If it's already a CustomRpcException, just re-throw it
      if (error instanceof CustomRpcException) {
        throw error;
      }

      // Otherwise, wrap it in a new CustomRpcException
      throw new CustomRpcException(
        error.message || 'Failed to create user.',
        500,
        ServiceName.USER_SERVICE,
      );
    }
  }

  @MessagePattern({ cmd: 'validate_user' })
  async validateUser(@Payload() data: LoginUserDto) {
    try {
      const user = await this.userServiceService.validateUser(data);
      return {
        success: true,
        message: 'User validated successfully',
        data: user,
      };
    } catch (error) {
      this.logger.error('User service validation error:', error);

      if (error instanceof CustomRpcException) {
        this.logger.error('User validation error:', error);
      }

      throw new CustomRpcException(
        error.message || 'Failed to validate user.',
        500,
        ServiceName.USER_SERVICE,
      );
    }
  }

  @MessagePattern(MessagePatterns.USER_SERVICE.GET_PROFILE)
  async getUserById(@Payload() userId: string) {
    try {
      const result = await this.userServiceService.getProfile(userId);
      return {
        success: true,
        message: 'User profile fetched successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Get user by ID error:', error);
    }
  }

  @MessagePattern(MessagePatterns.USER_SERVICE.UPDATE_USER_ROLE)
  async updateUserRole(@Payload() data: { userId: string; role: string }) {
    try {
      const result = await this.userServiceService.addUserRole(data.userId, data.role);
      return {
        success: true,
        message: 'User role updated successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Update user role error:', error);

      if (error instanceof CustomRpcException) {
        throw error;
      }

      throw new CustomRpcException(
        error.message || 'Failed to update user role.',
        500,
        ServiceName.USER_SERVICE,
      );
    }
  }
}
