import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/orm/prisma.service';
import { CreateMenuItemDto } from './dto/menuItem.dto';
import { MenuItem } from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async getAll() {
    return this.prismaService.menuItem.findMany();
  }

  async getById(menuId: number) {
    return this.prismaService.menuItem.findUnique({
      where: {
        id: Number(menuId),
      }
    })
  }

  async createMenuItem(data: CreateMenuItemDto): Promise<MenuItem> {
    return this.prismaService.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
      }
    });
  }

  async deleteMenuItem(menuId: number) {
    return this.prismaService.menuItem.delete({
      where: {
        id: Number(menuId),
      }
    })
  }

  async updateMenuItem(menuId: number, updateData) {
    return this.prismaService.menuItem.update({
      where: {
        id: Number(menuId)
      },
      data: updateData,
    })
  }
}
