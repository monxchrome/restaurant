import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../core/orm/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { NotFoundException } from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;
  let notificationService: NotificationService;

  const mockOrder: Order = {
    id: 1,
    clientName: 'John',
    clientSurname: 'Doe',
    clientPhone: '1234567890',
    deliveryAddress: '123 Main St',
    status: OrderStatus.PENDING,
    waiterId: null,
    totalPrice: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateOrderDto: CreateOrderDto = {
    clientName: 'John',
    clientSurname: 'Doe',
    clientPhone: '1234567890',
    deliveryAddress: '123 Main St',
    totalPrice: 100,
    items: [
      {
        menuItemId: 1,
        quantity: 2,
        price: 50,
      },
    ],
  };

  const mockPrismaService = {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    orderItem: {
      deleteMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockNotificationService = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return an array of orders', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);
      const result = await service.getAll();
      expect(result).toEqual([mockOrder]);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        include: { items: true },
      });
    });
  });

  describe('getById', () => {
    it('should return an order by id', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      const result = await service.getById(1);
      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { items: true },
      });
    });

    it('should return null if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);
      const result = await service.getById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new order and send notifications', async () => {
      mockPrismaService.order.create.mockResolvedValue(mockOrder);
      mockPrismaService.user.findMany.mockResolvedValue([
        { pushToken: 'token1' },
        { pushToken: 'token2' },
      ]);
      mockNotificationService.sendNotification.mockResolvedValue(undefined);

      const result = await service.create(mockCreateOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          clientName: mockCreateOrderDto.clientName,
          clientSurname: mockCreateOrderDto.clientSurname,
          clientPhone: mockCreateOrderDto.clientPhone,
          deliveryAddress: mockCreateOrderDto.deliveryAddress,
          status: 'PENDING',
          waiterId: null,
          totalPrice: mockCreateOrderDto.totalPrice,
          items: {
            create: mockCreateOrderDto.items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateOrder', () => {
    it('should update an order and send notification if waiterId exists', async () => {
      const updateData = { status: OrderStatus.PREPARING, waiterId: 1 };
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.PREPARING,
        waiterId: 1,
      };
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);
      mockPrismaService.user.findUnique.mockResolvedValue({
        pushToken: 'waiterToken',
      });
      mockNotificationService.sendNotification.mockResolvedValue(undefined);

      const result = await service.updateOrder(1, updateData);

      expect(result).toEqual(updatedOrder);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: updateData.status,
          waiter: { connect: { id: updateData.waiterId } },
        },
        include: { items: true },
      });
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        'waiterToken',
        'Обновлен статус заказа',
        `Статус заказа #1 изменён на ${OrderStatus.PREPARING}`,
      );
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderItem.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.order.delete.mockResolvedValue(mockOrder);

      const result = await service.deleteOrder(1);

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.orderItem.deleteMany).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.order.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);
      await expect(service.deleteOrder(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrdersCountByStatus', () => {
    it('should return orders count by status', async () => {
      const mockResult = [
        { status: OrderStatus.PENDING, _count: { id: 5 } },
        { status: OrderStatus.PREPARING, _count: { id: 3 } },
      ];
      mockPrismaService.order.groupBy.mockResolvedValue(mockResult);

      const result = await service.getOrdersCountByStatus(
        '2023-01-01',
        '2023-12-31',
      );

      expect(result).toEqual(mockResult);
      expect(mockPrismaService.order.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        where: {
          createdAt: {
            gte: new Date('2023-01-01'),
            lte: new Date('2023-12-31'),
          },
        },
        _count: { id: true },
      });
    });
  });

  describe('getOrdersCountByDay', () => {
    it('should return orders count by day', async () => {
      const mockResult = [
        { day: '2023-01-01', count: 5 },
        { day: '2023-01-02', count: 3 },
      ];
      mockPrismaService.$queryRaw.mockResolvedValue(mockResult);

      const result = await service.getOrdersCountByDay(
        '2023-01-01',
        '2023-01-02',
      );

      expect(result).toEqual(mockResult);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('getRevenueByDay', () => {
    it('should return revenue by day', async () => {
      const mockResult = [
        { day: '2023-01-01', revenue: 500 },
        { day: '2023-01-02', revenue: 300 },
      ];
      mockPrismaService.$queryRaw.mockResolvedValue(mockResult);

      const result = await service.getRevenueByDay('2023-01-01', '2023-01-02');

      expect(result).toEqual(mockResult);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('getAverageCheck', () => {
    it('should return average check', async () => {
      mockPrismaService.order.aggregate.mockResolvedValue({
        _avg: { totalPrice: 75.5 },
      });

      const result = await service.getAverageCheck('2023-01-01', '2023-01-02');

      expect(result).toBe(75.5);
      expect(mockPrismaService.order.aggregate).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date('2023-01-01'),
            lte: new Date('2023-01-02'),
          },
        },
        _avg: { totalPrice: true },
      });
    });
  });

  describe('getSummaryStats', () => {
    it('should return summary statistics', async () => {
      const mockCountByStatus = [
        { status: OrderStatus.PENDING, _count: { id: 5 } },
      ];
      const mockRevenueByDay = [{ day: '2023-01-01', revenue: 500 }];
      const mockAverageCheck = 100;

      mockPrismaService.order.groupBy.mockResolvedValue(mockCountByStatus);
      mockPrismaService.$queryRaw
        .mockResolvedValueOnce(mockRevenueByDay)
        .mockResolvedValueOnce(mockRevenueByDay);
      mockPrismaService.order.aggregate.mockResolvedValue({
        _avg: { totalPrice: mockAverageCheck },
      });

      const result = await service.getSummaryStats('2023-01-01', '2023-01-02');

      expect(result).toEqual({
        totalOrders: 5,
        countByStatus: mockCountByStatus,
        totalRevenue: 500,
        averageCheck: mockAverageCheck,
      });
    });
  });
});
