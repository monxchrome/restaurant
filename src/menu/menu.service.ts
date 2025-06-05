import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/orm/prisma.service';
import { CreateMenuItemDto } from './dto/menuItem.dto';
import { Category, MenuItem } from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async getAll(category?: string) {
    let where = {};

    if (category && Object.values(Category).includes(category as Category)) {
      where = { category: category as Category };
    }

    return this.prismaService.menuItem.findMany({ where });
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
        category: data.category,
        visible: data.visible,
        inStock: data.inStock
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
