import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [UsersModule, MenuModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
