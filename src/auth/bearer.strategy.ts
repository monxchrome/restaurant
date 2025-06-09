import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Strategy } from 'passport-http-bearer';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, 'bearer') {
  constructor(
    private authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {
    super();
  }

  async validate(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verify(token);
      const user: User | null = await this.userService.getById(payload.id);

      if (!user) throw new UnauthorizedException();

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}