import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateMenuItemDto } from './dto/menuItem.dto';
import { HttpStatus } from '@nestjs/common';
import { Express } from 'express';

describe('MenuController', () => {
  let menuController: MenuController;
  let menuService: MenuService;

  const mockMenuService = {
    createMenuItem: jest.fn(),
    deleteMenuItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [{ provide: MenuService, useValue: mockMenuService }],
    }).compile();

    menuController = module.get<MenuController>(MenuController);
    menuService = module.get<MenuService>(MenuService);
  });

  it('should create menu item with image', async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const body: CreateMenuItemDto = {
      name: 'New Item',
      price: 150,
    };

    const mockFile: Express.Multer.File = {
      fieldname: 'image',
      originalname: 'image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1234,
      destination: './public/menuItems',
      filename: 'image.jpg',
      path: './public/menuItems/image.jpg',
      buffer: Buffer.from(''),
      stream: null,
    };

    const files = { image: [mockFile] };

    const expected = {
      id: 1,
      name: 'New Item',
      price: 150,
      imageUrl: '/public/menuItems/image.jpg',
    };

    mockMenuService.createMenuItem.mockResolvedValue(expected);

    await menuController.createMenuItem({}, mockRes as any, { ...body }, files);

    expect(mockMenuService.createMenuItem).toHaveBeenCalledWith({
      ...body,
      imageUrl: '/public/menuItems/image.jpg',
    });
    expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(mockRes.json).toHaveBeenCalledWith(expected);
  });
});
