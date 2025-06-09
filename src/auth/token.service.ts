import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/orm/prisma.service';

@Injectable()
export class TokenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: number; refreshToken: string; expiresAt: Date }) {
    return this.prisma.token.create({ data });
  }

  async findValidToken(userId: number, refreshToken: string) {
    return this.prisma.token.findFirst({
      where: {
        userId,
        refreshToken,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async deleteToken(refreshToken: string) {
    return this.prisma.token.deleteMany({
      where: { refreshToken },
    });
  }
}
