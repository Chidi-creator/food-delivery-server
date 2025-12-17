import { Controller, Get } from '@nestjs/common';
import { EmailNotificationService } from './email-notification-service.service';
import { EventPattern } from '@nestjs/microservices';
import { NotificationMessage } from '@chidi-food-delivery/common';
import { NotificationManager } from './notifiation-manager';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';

@Controller()
export class NotificationServiceController {
  constructor(private readonly notificationManager: NotificationManager) {}

  @EventPattern(MessagePatterns.NOTIFICATION_SERVICE.SEND_NOTIFICATION)
  async handleUserRegisteredEvent(data: NotificationMessage) {
    await this.notificationManager.sendNotification(data);
  }
}
