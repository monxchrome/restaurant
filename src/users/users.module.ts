import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  controllers: [UsersController, NotificationModule],
  providers: [UsersService],
})
export class UsersModule {}
