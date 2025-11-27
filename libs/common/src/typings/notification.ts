import { NotificationType } from '../global/common';

export interface INotificationBase {
  type: NotificationType;
  recipient: string;
  event: string;
}

export interface IEmailNotification extends INotificationBase {
  type: NotificationType.EMAIL;
  subject: string;
  text: string;
  html?: string;
}

export interface ISMSNotification extends INotificationBase {
  type: NotificationType.SMS;
  message: string;
}

export type NotificationMessage = IEmailNotification | ISMSNotification;