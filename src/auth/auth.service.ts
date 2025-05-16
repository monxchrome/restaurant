import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {
  }
  async compareHash(bodyPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(bodyPassword, hash);
  }

  async signIn(userId: string) {
    return this.jwtService.sign({id: userId})
  }
}
