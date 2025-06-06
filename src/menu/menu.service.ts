import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/orm/prisma.service';
import { CreateMenuItemDto } from './dto/menuItem.dto';
import { Category, MenuItem } from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async getAll(params?: {
    category?: string;
    visible?: boolean;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      category,
      visible,
      inStock,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params || {};

    const where: any = {};

    if (category && Object.values(Category).includes(category as Category)) {
      where.category = category;
    }

    if (typeof visible === 'boolean') {
      where.visible = visible;
    }

    if (typeof inStock === 'boolean') {
      where.inStock = inStock;
    }

    if (typeof minPrice === 'number' || typeof maxPrice === 'number') {
      where.price = {};
      if (typeof minPrice === 'number') where.price.gte = minPrice;
      if (typeof maxPrice === 'number') where.price.lte = maxPrice;
    }

    const orderBy = sortBy ? { [sortBy]: sortOrder } : undefined;

    return this.prismaService.menuItem.findMany({
      where,
      orderBy,
    });
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
    await this.prismaService.orderItem.deleteMany({
      where: { menuItemId: Number(menuId) },
    });

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
