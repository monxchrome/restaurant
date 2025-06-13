import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../core/orm/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { CreateGuestOrderDto, CreateOrderDto } from './dto/order.dto';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly orderGateway: OrderGateway,
  ) {}

  async getAll(
    page: number,
    pageSize: number,
    filters?: {
      status?: OrderStatus | 'all';
      clientName?: string;
    },
    sort?: {
      sortBy?: keyof Order;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    if (filters?.clientName) {
      where.clientName = { contains: filters.clientName, mode: 'insensitive' };
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {};

    if (sort?.sortBy) {
      orderBy[sort.sortBy] = sort.sortOrder ?? 'asc';
    } else {
      orderBy['id'] = 'desc';
    }

    const [orders, total] = await Promise.all([
      this.prismaService.order.findMany({
        skip,
        take: pageSize,
        where,
        include: { items: true },
        orderBy,
      }),
      this.prismaService.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      pageSize,
    };
  }

  async getById(orderId: number): Promise<Order | null> {
    return this.prismaService.order.findUnique({
      where: { id: Number(orderId) },
      include: { items: true },
    });
  }

  async create(data: CreateOrderDto): Promise<Order> {
    const menuItemIds = data.items.map((item) => item.menuItemId);

    const existingMenuItems = await this.prismaService.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
      },
    });

    if (existingMenuItems.length !== menuItemIds.length) {
      throw new BadRequestException(
        'One or more menu items in the order do not exist.',
      );
    }

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
          create: data.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    this.orderGateway.sendOrderUpdate({
      type: 'CREATED',
      order,
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

  async createGuestOrder(data: CreateGuestOrderDto): Promise<Order> {
    const menuItemIds = data.items.map((item) => item.menuItemId);

    const existingMenuItems = await this.prismaService.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
      },
    });

    if (existingMenuItems.length !== menuItemIds.length) {
      throw new BadRequestException(
        'One or more menu items in the order do not exist.',
      );
    }

    const order = await this.prismaService.order.create({
      data: {
        clientName: data.clientName,
        clientSurname: data.clientSurname,
        clientPhone: data.clientPhone,
        deliveryAddress: data.deliveryAddress,
        guestPushToken: data.pushToken,
        totalPrice: data.totalPrice,
        items: { create: data.items },
      },
      include: { items: true },
    });

    this.orderGateway.sendOrderUpdate({
      type: 'CREATED',
      order,
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

  async updateOrderStatus(orderId: number, updateData): Promise<Order> {
    const data: any = {
      status: updateData.status,
    };

    if (updateData.waiterId) {
      data.waiter = { connect: { id: updateData.waiterId } };
    }

    const updatedOrder = await this.prismaService.order.update({
      where: { id: Number(orderId) },
      data,
      include: { items: true, client: true },
    });

    this.orderGateway.sendOrderUpdate({
      type: 'UPDATED',
      order: updatedOrder,
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

    if (updatedOrder.client && updatedOrder.client.pushToken) {
      const title = `Статус вашего заказа обновлен`;
      const body = `Заказ #${orderId} теперь в статусе "${updatedOrder.status}"`;

      await this.notificationService.sendNotification(
        updatedOrder.client.pushToken,
        title,
        body,
      );
    }

    return updatedOrder;
  }

  async updateOrder(orderId: number, updateData): Promise<Order> {
    const updatedOrder = await this.prismaService.order.update({
      where: { id: Number(orderId) },
      data: updateData,
      include: { items: true },
    });

    this.orderGateway.sendOrderUpdate({
      type: 'UPDATED',
      order: updatedOrder,
    });

    return updatedOrder;
  }

  async deleteOrder(orderId: number): Promise<Order> {
    const existingOrder = await this.prismaService.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    await this.prismaService.orderItem.deleteMany({
      where: { id: Number(orderId) },
    });

    return this.prismaService.order.delete({
      where: { id: Number(orderId) },
    });
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

    return this.prismaService.$queryRaw<{ day: string; count: number }[]>`
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

    return this.prismaService.$queryRaw<{ day: string; revenue: number }[]>`
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

    const totalOrders = countByStatus.reduce(
      (sum, item) => sum + item._count.id,
      0,
    );

    const totalRevenue = revenueByDay.reduce(
      (sum, item) => sum + Number(item.revenue),
      0,
    );

    return {
      totalOrders,
      countByStatus,
      totalRevenue,
      averageCheck,
    };
  }

  private async getAdminFcmTokens(): Promise<string[]> {
    const admins = await this.prismaService.user.findMany({
      where: { role: 'ADMIN' },
      select: { pushToken: true },
    });

    return admins.map((a) => a.pushToken).filter(Boolean) as string[];
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
}
