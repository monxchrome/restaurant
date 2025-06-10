import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('compareHash', () => {
    it('should return true if passwords match', async () => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      const result = await authService.compareHash(
        'plainPassword',
        'hashedPassword',
      );
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plainPassword',
        'hashedPassword',
      );
    });

    it('should return false if passwords do not match', async () => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));
      const result = await authService.compareHash(
        'plainPassword',
        'wrongHash',
      );
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'wrongHash');
    });
  });

  describe('signIn', () => {
    it('should call jwtService.sign with correct payload', async () => {
      const signMock = jest
        .spyOn(jwtService, 'sign')
        .mockReturnValue('signedToken');
      const token = await authService.signIn('userId123');
      expect(signMock).toHaveBeenCalledWith({ id: 'userId123' });
      expect(token).toBe('signedToken');
    });
  });

  describe('generateRefreshToken', () => {
    it('should call jwtService.sign with correct payload and options', async () => {
      const signMock = jest
        .spyOn(jwtService, 'sign')
        .mockReturnValue('refreshToken');

      process.env.JWT_REFRESH_SECRET = 'secretKey';
      process.env.JWT_REFRESH_EXPIRES_IN = '7d';

      const token = await authService.generateRefreshToken('userId456');

      expect(signMock).toHaveBeenCalledWith(
        { id: 'userId456' },
        {
          secret: 'secretKey',
          expiresIn: '7d',
        },
      );
      expect(token).toBe('refreshToken');
    });
  });
});
