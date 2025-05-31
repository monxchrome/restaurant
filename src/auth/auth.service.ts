import { Inject, Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(JwtService) private readonly defaultJwtService: JwtService,
  ) {
  }
  async compareHash(bodyPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(bodyPassword, hash);
  }

  async signIn(userId: string) {
    return this.jwtService.sign({ id: userId })
  }

  async generateRefreshToken(userId: string) {
    return this.jwtService.sign(
      { id: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    );
  }
}
