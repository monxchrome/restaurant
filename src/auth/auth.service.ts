import { Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { addDays } from 'date-fns';
import { PrismaService } from '../core/orm/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
  }
  async compareHash(bodyPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(bodyPassword, hash);
  }

  async generateTokenPair(userId: number) {
    const accessToken = this.jwtService.sign({ id: userId });
    const refreshToken = this.jwtService.sign(
      { id: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }
    );

    const expiresAt = addDays(new Date(), 7);

    await this.prisma.token.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(oldRefreshToken: string) {
    console.log('Refresh token received:', oldRefreshToken);
    try {
      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      console.log('Payload:', payload);

      const tokenInDb = await this.prisma.token.findFirst({
        where: {
          refreshToken: oldRefreshToken,
        },
      });
      console.log('Token in DB:', tokenInDb);

      if (!tokenInDb) {
        throw new UnauthorizedException('Refresh token not found');
      }

      await this.prisma.token.delete({
        where: { id: tokenInDb.id },
      });

      return this.generateTokenPair(payload.id);
    } catch (e) {
      console.error('Refresh token error:', e);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
