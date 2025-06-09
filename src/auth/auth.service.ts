import { Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/orm/prisma.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
    private tokenService: TokenService
  ) {
  }
  async compareHash(bodyPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(bodyPassword, hash);
  }

  async generateTokenPair(userId: number) {
    const payload = { id: userId };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.tokenService.create({
      userId,
      refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const tokenRecord = await this.tokenService.findValidToken(payload.id, refreshToken);
      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token not found or expired');
      }

      return this.generateTokenPair(payload.id);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.tokenService.deleteToken(refreshToken);
  }

  async getMe(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        phone: true,
        role: true,
      },
    });
  }
}
