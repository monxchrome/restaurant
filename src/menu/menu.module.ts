import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { PrismaModule } from '../core/orm/prisma.module';
import { PrismaService } from '../core/orm/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthModule } from '../auth/auth.module';
import { GcsModule } from '../common/services/gcs.module';

@Module({
  imports: [PrismaModule, AuthModule, GcsModule],
  controllers: [MenuController],
  providers: [MenuService, UsersService, PrismaService],
  exports: [MenuService],
})
export class MenuModule {}
