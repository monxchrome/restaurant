import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: Partial<Record<keyof OrdersService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      getAll: jest.fn(),
      getById: jest.fn(),
      deleteOrder: jest.fn(),
      create: jest.fn(),
      updateOrder: jest.fn(),
      getOrdersCountByStatus: jest.fn(),
      getOrdersCountByDay: jest.fn(),
      getRevenueByDay: jest.fn(),
      getAverageCheck: jest.fn(),
      getSummaryStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: service }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  const mockRes = () => {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  };

  it('should get all orders', async () => {
    const res = mockRes();
    const orders = [{ id: 1, clientName: 'John' }];
    service.getAll.mockResolvedValue(orders);

    await controller.getAll({}, res as any);

    expect(service.getAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(orders);
  });

  it('should get order by id', async () => {
    const res = mockRes();
    const orderId = 1;
    const order = { id: orderId, clientName: 'John' };
    service.getById.mockResolvedValue(order);

    await controller.getById({}, res as any, orderId);

    expect(service.getById).toHaveBeenCalledWith(orderId);
    expect(res.status).toHaveBeenCalledWith(302);
    expect(res.json).toHaveBeenCalledWith(order);
  });

  it('should delete order by id', async () => {
    const res = mockRes();
    const orderId = 1;
    const deletedOrder = { id: orderId, clientName: 'John' };
    service.deleteOrder.mockResolvedValue(deletedOrder);

    await controller.deleteById({}, res as any, orderId);

    expect(service.deleteOrder).toHaveBeenCalledWith(orderId);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(deletedOrder);
  });

  it('should create order', async () => {
    const res = mockRes();
    const createOrderDto: CreateOrderDto = {
      clientName: 'John',
      clientSurname: 'Doe',
      clientPhone: '1234567890',
      totalPrice: 100,
      items: [{ menuItemId: 1, quantity: 2, price: 50 }],
    };
    const createdOrder = { id: 1, ...createOrderDto };
    service.create.mockResolvedValue(createdOrder);

    await controller.createOrder({}, res as any, createOrderDto);

    expect(service.create).toHaveBeenCalledWith(createOrderDto);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdOrder);
  });

  it('should return 400 when create order throws', async () => {
    const res = mockRes();
    const createOrderDto: CreateOrderDto = {
      clientName: 'John',
      clientSurname: 'Doe',
      clientPhone: '1234567890',
      totalPrice: 100,
      items: [{ menuItemId: 1, quantity: 2, price: 50 }],
    };
    const error = new Error('Test error');
    service.create.mockRejectedValue(error);

    await controller.createOrder({}, res as any, createOrderDto);

    expect(service.create).toHaveBeenCalledWith(createOrderDto);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Test error' });
  });

  it('should update order', async () => {
    const res = mockRes();
    const orderId = 1;
    const updateOrderDto: UpdateOrderDto = {
      clientName: 'Jane',
    };
    const updatedOrder = { id: orderId, clientName: 'Jane' };
    service.updateOrder.mockResolvedValue(updatedOrder);

    await controller.updateOrder({}, res as any, orderId, updateOrderDto);

    expect(service.updateOrder).toHaveBeenCalledWith(orderId, updateOrderDto);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(updatedOrder);
  });

  it('should throw BadRequestException if update data is empty', async () => {
    const res = mockRes();
    const orderId = 1;
    const emptyBody = {};

    await expect(
      controller.updateOrder({}, res as any, orderId, emptyBody),
    ).rejects.toThrow('No update data provided');
  });
});
