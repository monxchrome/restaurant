import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data,
        token: deviceToken,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Notification sent: ${response}`);
    } catch (error) {
      this.logger.error('Failed to send push notification', error);
    }
  }
}
