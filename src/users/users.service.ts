import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/orm/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import { User } from '@prisma/client';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll() {
    return this.prismaService.user.findMany();
  }

  async getById(userId: number) {
    return this.prismaService.user.findUnique({
      where: {
        id: Number(userId),
      }
    });
  }

  async getByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      }
    })
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        surname: userData.surname,
        phone: userData.phone,
      }
    })
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, +process.env.PASSWORD_SALT);
  }

  async deleteUser(userId: number) {
    return this.prismaService.user.delete({
      where: {
        id: Number(userId),
      }
    })
  }

  async updateUser(userId: number, updateData) {
    return this.prismaService.user.update({
      where: {
        id: Number(userId)
      },
      data: updateData,
    })
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
      }
    })
  }
}
