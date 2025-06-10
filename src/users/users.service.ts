import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../core/orm/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import { User } from '@prisma/client';

import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async getAll() {
    return this.prismaService.user.findMany();
  }

  async getById(userId: number) {
    return this.prismaService.user.findUnique({
      where: {
        id: Number(userId),
      },
    });
  }

  async getByEmail(email: string) {
    return this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        surname: userData.surname,
        phone: userData.phone,
      },
    });
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, +process.env.PASSWORD_SALT);
  }

  async deleteUser(userId: number) {
    return this.prismaService.user.delete({
      where: {
        id: Number(userId),
      },
    });
  }

  async updateUser(userId: number, updateData) {
    return this.prismaService.user.update({
      where: {
        id: Number(userId),
      },
      data: updateData,
    });
  }

  async registerUser(userData: CreateUserDto): Promise<User> {
    const passwordHash = await this.hashPassword(userData.password);

    return this.prismaService.user.create({
      data: {
        email: userData.email,
        password: passwordHash,
        name: userData.name,
        surname: userData.surname,
        phone: userData.phone,
      },
    });
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isMatched = await this.authService.compareHash(
      oldPassword,
      user.password,
    );

    if (!isMatched) {
      throw new BadRequestException('Old password does not match');
    }

    const hashNewPassword = await this.hashPassword(newPassword);
    await this.prismaService.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        password: hashNewPassword,
      },
    });
  }
}
