import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../core/orm/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
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

  const mockUpdateUserDto = {
    email: 'updated@example.com',
    name: 'Jane',
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Mock bcrypt
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    process.env.PASSWORD_SALT = '10';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.getAll();

      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return a user by ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getById(1);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('getByEmail', () => {
    it('should return a user by email', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.getByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('createUser', () => {
    it('should create a user without hashing password', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser(mockCreateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: mockCreateUserDto.email,
          password: mockCreateUserDto.password,
          name: mockCreateUserDto.name,
          surname: mockCreateUserDto.surname,
          phone: mockCreateUserDto.phone,
        },
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('hashPassword', () => {
    it('should hash a password using bcrypt', async () => {
      const password = 'securePassword123';
      const hashedPassword = 'hashedPassword';

      const result = await service.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.deleteUser(1);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.updateUser(1, mockUpdateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockUpdateUserDto,
      });
    });
  });

  describe('registerUser', () => {
    it('should create a user with hashed password', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.registerUser(mockCreateUserDto);

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: mockCreateUserDto.email,
          password: 'hashedPassword',
          name: mockCreateUserDto.name,
          surname: mockCreateUserDto.surname,
          phone: mockCreateUserDto.phone,
        },
      });
    });
  });
});