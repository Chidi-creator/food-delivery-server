import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { EmailNotificationService } from './email-notification-service.service';
import {
  CustomRpcException,
  NotificationMessage,
  NotificationType,
  ServiceName,
} from '@chidi-food-delivery/common';
import BaseNotificationService from './base';

@Injectable()
export class NotificationManager {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  async sendNotification(message: NotificationMessage) {
    const { type } = message;
    Logger.log(`Sending notification of type: ${type}`, 'NotificationManager');
    let service: BaseNotificationService;

    switch (type) {
      case NotificationType.EMAIL:
        service = this.emailNotificationService;
        break;

      default:
        throw new CustomRpcException(
          `No service available for notification type: ${type}`,
          400,
          ServiceName.NOTIFICATION_SERVICE,
        );
    }

    await service.sendNotification(message);
  }
}
