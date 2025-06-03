import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { NotificationModule } from '../notifications/notification.module';
import { PrismaModule } from '../core/orm/prisma.module';
import { OrderGateway } from './order.gateway';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderGateway],
})
export class OrdersModule {}
