import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Response } from 'express';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'John',
    surname: 'Doe',
    phone: '+1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'securePassword123',
    name: 'John',
    surname: 'Doe',
    phone: '+1234567890',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    email: 'updated@example.com',
    name: 'Jane',
  };

  const mockUsersService = {
    getAll: jest.fn(),
    createUser: jest.fn(),
    getById: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all users with ACCEPTED status', async () => {
      mockUsersService.getAll.mockResolvedValue([mockUser]);

      await controller.getAll({}, mockResponse);

      expect(mockUsersService.getAll).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.ACCEPTED);
      expect(mockResponse.json).toHaveBeenCalledWith([mockUser]);
    });
  });

  describe('createUser', () => {
    it('should create a user and return CREATED status', async () => {
      mockUsersService.createUser.mockResolvedValue(mockUser);

      await controller.createUser({}, mockResponse, mockCreateUserDto);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(mockCreateUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getById', () => {
    it('should return a user by ID with FOUND status', async () => {
      mockUsersService.getById.mockResolvedValue(mockUser);

      await controller.getById({}, mockResponse, 1);

      expect(mockUsersService.getById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return FOUND status', async () => {
      mockUsersService.deleteUser.mockResolvedValue(mockUser);

      await controller.deleteUser({}, mockResponse, 1);

      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user and return ACCEPTED status', async () => {
      mockUsersService.updateUser.mockResolvedValue(mockUser);

      await controller.updateUser({}, mockResponse, 1, mockUpdateUserDto);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith(1, mockUpdateUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.ACCEPTED);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should throw BadRequestException if no update data provided', async () => {
      await expect(
        controller.updateUser({}, mockResponse, 1, {})
      ).rejects.toThrow(BadRequestException);
      expect(mockUsersService.updateUser).not.toHaveBeenCalled();
    });
  });
});