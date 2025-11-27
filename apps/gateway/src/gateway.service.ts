import {
  CreateUserDto,
  NotificationMessage,
  NotificationType,
  ServiceName,
  ServiceUnavailableException,
} from '@chidi-food-delivery/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';

@Injectable()
export class GatewayService {
  constructor(
    @Inject(ServiceName.USER_SERVICE)
    private readonly userServiceClient: ClientProxy,
    @Inject(ServiceName.NOTIFICATION_SERVICE)
    private readonly notificationServiceClient: ClientProxy,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async registerUser(request: CreateUserDto) {
    try {
      // Send request to user service and wait for response with 5 second timeout
      const result = await firstValueFrom(
        this.userServiceClient.send({ cmd: 'register_user' }, request).pipe(
          timeout(5000), // 5 second timeout
        ),
      );

      // Check if user creation was successful before sending notification
      if (result.success) {
        const notificationPayload: NotificationMessage = {
          type: NotificationType.EMAIL,
          recipient: request.email,
          event: 'user_registered',
          subject: 'Welcome to Chidi Food Delivery!',
          text: `Hello ${request.firstName},\n\nThank you for registering with Chidi Food Delivery. We're excited to have you on board!\n\nBest regards,\nChidi Food Delivery Team`,
        };
        // Only send notification if registration was successful
        this.notificationServiceClient.emit('user_registered', notificationPayload);
      }

      return {
        success: true,
        message: 'User registered successfully',
        data: result,
      };
    } catch (error) {
      // If there's an error, definitely don't send notification
      console.error('Gateway registration error:', error);
      
      // Check if it's a timeout or connection error
      if (error.name === 'TimeoutError' || error.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException(
          'User service is currently unavailable. Please try again later.',
        );
      }
      
      // Re-throw the error so it gets handled by exception filter
      throw error;
    }
  }
}
