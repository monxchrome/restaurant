import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [UsersModule, AuthModule, MenuModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
