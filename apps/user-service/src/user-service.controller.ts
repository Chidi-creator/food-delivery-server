import { Controller, Get } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto, CustomRpcException, ServiceName } from '@chidi-food-delivery/common';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}


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
        data: result
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
}
