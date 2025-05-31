import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from './menu.service';
import { PrismaService } from '../core/orm/prisma.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menuItem.dto';

describe('MenuService', () => {
  let service: MenuService;
  let prismaMock: {
    menuItem: {
      findMany: jest.Mock,
      findUnique: jest.Mock,
      create: jest.Mock,
      delete: jest.Mock,
      update: jest.Mock,
    };
  };

  beforeEach(async () => {
    prismaMock = {
      menuItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  it('should get all menu items', async () => {
    const mockItems = [
      {
        id: 1,
        name: 'Пицца',
        description: 'Сырная',
        price: 500,
        imageUrl: null,
        createdAt: new Date(),
      },
    ];

    prismaMock.menuItem.findMany.mockResolvedValue(mockItems);

    const result = await service.getAll();

    expect(result).toEqual(mockItems);
    expect(prismaMock.menuItem.findMany).toHaveBeenCalled();
  });

  it('should get menu item by ID', async () => {
    const mockItem = {
      id: 1,
      name: 'Суп',
      description: 'Горячий',
      price: 300,
      imageUrl: null,
      createdAt: new Date(),
    };

    prismaMock.menuItem.findUnique.mockResolvedValue(mockItem);

    const result = await service.getById(1);

    expect(result).toEqual(mockItem);
    expect(prismaMock.menuItem.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should create a menu item', async () => {
    const dto: CreateMenuItemDto = {
      name: 'Салат',
      description: 'Овощной',
      price: 200,
      imageUrl: '/public/menuItems/salad.jpg',
    };

    const createdItem = {
      id: 2,
      ...dto,
      createdAt: new Date(),
    };

    prismaMock.menuItem.create.mockResolvedValue(createdItem);

    const result = await service.createMenuItem(dto);

    expect(result).toEqual(createdItem);
    expect(prismaMock.menuItem.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should delete a menu item', async () => {
    const deletedItem = {
      id: 3,
      name: 'Старое блюдо',
      description: 'Удалено',
      price: 100,
      imageUrl: null,
      createdAt: new Date(),
    };

    prismaMock.menuItem.delete.mockResolvedValue(deletedItem);

    const result = await service.deleteMenuItem(3);

    expect(result).toEqual(deletedItem);
    expect(prismaMock.menuItem.delete).toHaveBeenCalledWith({
      where: { id: 3 },
    });
  });

  it('should update a menu item', async () => {
    const updateDto: UpdateMenuItemDto = {
      name: 'Обновлённое блюдо',
      price: 999,
    };

    const updatedItem = {
      id: 4,
      name: updateDto.name,
      description: 'Старое описание',
      price: updateDto.price,
      imageUrl: null,
      createdAt: new Date(),
    };

    prismaMock.menuItem.update.mockResolvedValue(updatedItem);

    const result = await service.updateMenuItem(4, updateDto);

    expect(result).toEqual(updatedItem);
    expect(prismaMock.menuItem.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: updateDto,
    });
  });
});