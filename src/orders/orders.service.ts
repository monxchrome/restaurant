import { Injectable } from '@nestjs/common';
import { OrderDto } from './dto/order.dto';
import { Order } from '@prisma/client';
import { PrismaService } from '../core/orm/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService,) {}

  async getAll() {
    return this.prismaService.user.findMany();
  }

  async getById(orderId: number) {
    return this.prismaService.user.findUnique({
      where: {
        id: Number(orderId),
      }
    })
  }

  async create(data: OrderDto): Promise<Order> {
    return this.prismaService.order.create({
      data: {
        clientName: data.clientName,
        clientSurname: data.clientSurname,
        clientPhone: data.clientPhone,
        deliveryAddress: data.deliveryAddress,
        status: data.status ?? 'PENDING',
        waiterId: data.waiterId ?? null,
        totalPrice: data.totalPrice,
        items: {
          create: data.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async deleteOrder(orderId: number) {
    return this.prismaService.order.delete({
      where: {
        id: Number(orderId),
      }
    })
  }

  async updateOrder(orderId: number, updateData) {
    return this.prismaService.order.update({
      where: {
        id: Number(orderId)
      },
      data: updateData
    })
  }
}
