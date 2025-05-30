import { Injectable } from '@nestjs/common';
import { OrderDto } from './dto/order.dto';
import { Order } from '@prisma/client';
import { PrismaService } from '../core/orm/prisma.service';
import { NotificationService } from '../notifications/notification.service';

import { Prisma } from '@prisma/client';


@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAll(): Promise<Order[]> {
    return this.prismaService.order.findMany({
      include: { items: true },
    });
  }

  async getById(orderId: number): Promise<Order | null> {
    return this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
  }

  async create(data: OrderDto): Promise<Order> {
    const order = await this.prismaService.order.create({
      data: {
        clientName: data.clientName,
        clientSurname: data.clientSurname,
        clientPhone: data.clientPhone,
        deliveryAddress: data.deliveryAddress,
        status: data.status ?? 'PENDING',
        waiterId: data.waiterId ?? null,
        totalPrice: data.totalPrice,
        items: {
          create: data.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    const adminTokens = await this.getAdminFcmTokens();
    for (const token of adminTokens) {
      await this.notificationService.sendNotification(
        token,
        'Новый заказ',
        `Создан заказ от ${order.clientName} ${order.clientSurname}`,
      );
    }

    return order;
  }

  async updateOrder(orderId: number, updateData): Promise<Order> {
    const updatedOrder = await this.prismaService.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true },
    });

    if (updatedOrder.waiterId) {
      const waiterToken = await this.getWaiterFcmToken(updatedOrder.waiterId);
      if (waiterToken) {
        await this.notificationService.sendNotification(
          waiterToken,
          'Обновлен статус заказа',
          `Статус заказа #${orderId} изменён на ${updatedOrder.status}`,
        );
      }
    }

    return updatedOrder;
  }

  async deleteOrder(orderId: number): Promise<Order> {
    return this.prismaService.order.delete({
      where: { id: orderId },
    });
  }

  private async getAdminFcmTokens(): Promise<string[]> {
    const admins = await this.prismaService.user.findMany({
      where: { role: 'ADMIN' },
      select: { pushToken: true },
    });

    return admins.map(a => a.pushToken).filter(Boolean) as string[];
  }

  private async getWaiterFcmToken(waiterId: number): Promise<string | null> {
    const waiter = await this.prismaService.user.findUnique({
      where: { id: waiterId },
      select: { pushToken: true },
    });
    return waiter?.pushToken ?? null;
  }

  private buildDateFilter(startDate?: string, endDate?: string) {
    const filter: any = {};
    if (startDate && endDate) {
      filter.gte = new Date(startDate);
      filter.lte = new Date(endDate);
    } else if (startDate) {
      filter.gte = new Date(startDate);
    } else if (endDate) {
      filter.lte = new Date(endDate);
    }
    return Object.keys(filter).length ? filter : undefined;
  }

  async getOrdersCountByStatus(startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    return this.prismaService.order.groupBy({
      by: ['status'],
      where: {
        ...(dateFilter && { createdAt: dateFilter }),
      },
      _count: { id: true },
    });
  }

  async getOrdersCountByDay(startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    return this.prismaService.$queryRaw<
      { day: string; count: number }[]
    >`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
        COUNT(*) AS count
      FROM "Order"
      WHERE
        ${dateFilter ? Prisma.sql`"createdAt" BETWEEN ${dateFilter.gte ?? new Date(0)} AND ${dateFilter.lte ?? new Date()}` : Prisma.sql`TRUE`}
      GROUP BY day
      ORDER BY day ASC;
    `;
  }

  async getRevenueByDay(startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    return this.prismaService.$queryRaw<
      { day: string; revenue: number }[]
    >`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
        SUM("totalPrice") AS revenue
      FROM "Order"
      WHERE
        ${dateFilter ? Prisma.sql`"createdAt" BETWEEN ${dateFilter.gte ?? new Date(0)} AND ${dateFilter.lte ?? new Date()}` : Prisma.sql`TRUE`}
      GROUP BY day
      ORDER BY day ASC;
    `;
  }

  async getAverageCheck(startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    const result = await this.prismaService.order.aggregate({
      where: {
        ...(dateFilter && { createdAt: dateFilter }),
      },
      _avg: { totalPrice: true },
    });
    return result._avg.totalPrice ?? 0;
  }

  async getSummaryStats(startDate?: string, endDate?: string) {
    const [countByStatus, revenueByDay, averageCheck] = await Promise.all([
      this.getOrdersCountByStatus(startDate, endDate),
      this.getRevenueByDay(startDate, endDate),
      this.getAverageCheck(startDate, endDate),
    ]);

    const totalOrders = countByStatus.reduce((sum, item) => sum + item._count.id, 0);

    const totalRevenue = revenueByDay.reduce((sum, item) => sum + Number(item.revenue), 0);

    return {
      totalOrders,
      countByStatus,
      totalRevenue,
      averageCheck,
    };
  }
}
