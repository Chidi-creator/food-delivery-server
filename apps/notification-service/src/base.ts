import {
  CustomRpcException,
  NotificationMessage,
} from '@chidi-food-delivery/common';

class BaseNotificationService {
   throwNotImplementedError(methodName: string): never {
    throw new CustomRpcException(
      `Method ${methodName} must be implemented by the subclass.`,
      501,
      'notification-service',
    );
  }

   async validateRecipient(
    message: NotificationMessage,
  ): Promise<boolean> {
    this.throwNotImplementedError('validateRecipient');
  }

   async sendNotification(message: NotificationMessage): Promise<any> {
    this.throwNotImplementedError('sendNotification');
  }
}

export default BaseNotificationService;
