import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { NotificationModule } from '../notifications/notification.module';
import { PrismaModule } from '../core/orm/prisma.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
