import {
  CustomRpcException,
  IEmailNotification,
} from '@chidi-food-delivery/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class Nodemailer {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: this.configService.get<boolean>('MAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendMail(message: IEmailNotification): Promise<any> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: message.recipient,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (error) {
      // Handle error appropriately
      throw new CustomRpcException(
        `Failed to send email: ${error.message}`,
        500,
        'notification-service',
      );
    }
  }
}
