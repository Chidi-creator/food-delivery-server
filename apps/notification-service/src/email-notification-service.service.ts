import { Injectable } from '@nestjs/common';
import BaseNotificationService from './base';
import {
  CustomRpcException,
  NotificationMessage,
  NotificationType,
  ServiceName,
} from '@chidi-food-delivery/common';
import { Nodemailer } from './providers/nodemailer';

@Injectable()
export class EmailNotificationService extends BaseNotificationService {
  constructor(private readonly nodemailer: Nodemailer) {
    super();
  }

   async validateRecipient(
    message: NotificationMessage,
  ): Promise<boolean> {
    if (message.type !== NotificationType.EMAIL) {
      return false;
    }

    const recipient = message.recipient;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(recipient);
  }

   async sendNotification(message: NotificationMessage): Promise<any> {
    if (message.type !== NotificationType.EMAIL) {
      throw new CustomRpcException(
        'Invalid notification type for EmailNotificationService',
        400,
        ServiceName.NOTIFICATION_SERVICE,
      );
    }

    return this.nodemailer.sendMail(message);
  }
}
