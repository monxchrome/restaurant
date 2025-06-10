import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: Partial<AuthService>;
  let userService: Partial<UsersService>;

  beforeEach(async () => {
    authService = {
      compareHash: jest.fn(),
      signIn: jest.fn(),
      generateRefreshToken: jest.fn(),
    };

    userService = {
      getByEmail: jest.fn(),
      registerUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: userService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should return error if email is missing', async () => {
      await authController.login(mockRes, { password: '123' } as any);
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'ERROR.Check_request_email_param',
      });
    });

    it('should return error if password is missing', async () => {
      await authController.login(mockRes, { email: 'test@test.com' } as any);
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'ERROR.Check_request_password_param',
      });
    });

    it('should return unauthorized if user not found', async () => {
      (userService.getByEmail as jest.Mock).mockResolvedValue(null);

      await authController.login(mockRes, {
        email: 'test@test.com',
        password: '123',
      });

      expect(userService.getByEmail).toHaveBeenCalledWith('test@test.com');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email or password is incorrect',
      });
    });

    it('should return unauthorized if password does not match', async () => {
      (userService.getByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        password: 'hashed',
      });
      (authService.compareHash as jest.Mock).mockResolvedValue(false);

      await authController.login(mockRes, {
        email: 'test@test.com',
        password: 'wrongpass',
      });

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid email or password',
      });
    });

    it('should return tokens on successful login', async () => {
      const user = { id: 1, password: 'hashed' };
      (userService.getByEmail as jest.Mock).mockResolvedValue(user);
      (authService.compareHash as jest.Mock).mockResolvedValue(true);
      (authService.signIn as jest.Mock).mockResolvedValue('access-token');
      (authService.generateRefreshToken as jest.Mock).mockResolvedValue(
        'refresh-token',
      );

      await authController.login(mockRes, {
        email: 'test@test.com',
        password: 'correctpass',
      });

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('register', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should return error if user already exists', async () => {
      (userService.getByEmail as jest.Mock).mockResolvedValue({ id: 1 });

      await authController.register(mockRes, {
        email: 'test@test.com',
        password: '123',
        name: 'John',
        surname: 'Doe',
        phone: '123456',
        role: 'WAITER',
      });

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User is already exist',
      });
    });

    it('should register user and return token', async () => {
      (userService.getByEmail as jest.Mock).mockResolvedValue(null);
      (userService.registerUser as jest.Mock).mockResolvedValue({ id: 1 });
      (authService.signIn as jest.Mock).mockResolvedValue('jwt-token');

      await authController.register(mockRes, {
        email: 'newuser@test.com',
        password: '123',
        name: 'John',
        surname: 'Doe',
        phone: '123456',
        role: 'WAITER',
      });

      expect(userService.registerUser).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({ token: 'jwt-token' });
    });

    it('should return bad request if registration fails', async () => {
      (userService.getByEmail as jest.Mock).mockResolvedValue(null);
      (userService.registerUser as jest.Mock).mockResolvedValue(null);

      await authController.register(mockRes, {
        email: 'fail@test.com',
        password: '123',
        name: 'John',
        surname: 'Doe',
        phone: '123456',
        role: 'WAITER',
      });

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'ERROR.Failed_to_register_user',
      });
    });
  });
});
