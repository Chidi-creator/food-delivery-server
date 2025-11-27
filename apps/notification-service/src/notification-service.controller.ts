import { Controller, Get } from '@nestjs/common';
import { EmailNotificationService } from './email-notification-service.service';
import { EventPattern } from '@nestjs/microservices';
import { NotificationMessage } from '@chidi-food-delivery/common';
import { NotificationManager } from './notifiation-manager';

@Controller()
export class NotificationServiceController {
  constructor(
    private readonly notificationManager: NotificationManager,
  ) {}

  @EventPattern('user_registered')
  async handleUserRegisteredEvent(data: NotificationMessage) {
    await this.notificationManager.sendNotification(data);
  }
}
