import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';

import { Request, Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { addDays } from 'date-fns';
import { TokenService } from './token.service';
import { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private tokenService: TokenService,
  ) {}

  @Post('login')
  async login(@Res() res: any, @Body() body: LoginDto) {
    if (!body.email || !body.password) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: 'Email and password are required' });
    }

    const findUser = await this.userService.getByEmail(body.email);

    if (
      !findUser ||
      !(await this.authService.compareHash(body.password, findUser.password))
    ) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Email or password is incorrect' });
    }

    const tokenPair = await this.authService.generateTokenPair(findUser.id);

    const expiresAt = addDays(new Date(), 7);

    await this.tokenService.create({
      userId: findUser.id,
      refreshToken: tokenPair.refreshToken,
      expiresAt,
    });

    res.cookie('refreshToken', tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HttpStatus.OK).json({
      accessToken: tokenPair.accessToken,
    });
  }

  @Post('register')
  async register(@Res() res: any, @Body() body: RegisterDto) {
    if (
      process.env.NODE_ENV === 'production' &&
      body.secret !== process.env.REGISTRATION_SECRET
    ) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: 'Registration is disabled' });
    }

    const findUser = await this.userService.getByEmail(body.email.trim());

    if (findUser) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: 'User is already exist' });
    }

    const userData: any = {
      email: body.email,
      password: body.password,
      name: body.name,
      surname: body.surname,
      phone: body.phone,
    };

    if (body.role && body.role !== 'USER') {
      if (!body.secret) {
        throw new ForbiddenException(
          'A secret key is required to assign a custom role.',
        );
      }
      if (body.secret !== process.env.REGISTRATION_SECRET) {
        throw new ForbiddenException('Invalid secret key for role assignment.');
      }
      userData.role = body.role;
    }
    const user = await this.userService.registerUser(userData);

    if (user) {
      const tokenPair = await this.authService.generateTokenPair(user.id);

      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(HttpStatus.OK).json({
        accessToken: tokenPair.accessToken,
      });
    }

    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: 'ERROR.Failed_to_register_user' });
  }

  @Post('logout')
  async logout(@Req() req: any, @Res() res: any) {
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
      res.clearCookie('refreshToken');
    }
    return res.status(HttpStatus.OK).json({ message: 'Logged out' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Missing refresh token' });
    }

    try {
      const tokenPair = await this.authService.refreshTokens(refreshToken);

      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ accessToken: tokenPair.accessToken });
    } catch (e) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: e.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.id);
  }
}
