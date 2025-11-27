import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { EmailNotificationService } from './email-notification-service.service';
import { NotificationManager } from './notifiation-manager';
import { Nodemailer } from './providers/nodemailer';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/notification-service/.env',
    }),
  ],
  controllers: [NotificationServiceController],
  providers: [EmailNotificationService, NotificationManager, Nodemailer],
})
export class NotificationServiceModule {}
