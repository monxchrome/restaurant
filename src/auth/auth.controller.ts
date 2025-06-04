import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';

import { Request, Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) {}

  @Post('login')
  async login(@Res() res: any, @Body() body: LoginDto) {
    if (!body.email) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({message: "ERROR.Check_request_email_param"})
    }

    if (!body.password) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({message: "ERROR.Check_request_password_param"})
    }

    const findUser = await this.userService.getByEmail(body.email);

    if (!findUser) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({message: "Email or password is incorrect"})
    }

    if (await this.authService.compareHash(body.password, findUser.password)) {
      const tokenPair = await this.authService.generateTokenPair(
        findUser.id
      );

      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });


      return res.status(HttpStatus.OK).json({
        accessToken: tokenPair.accessToken,
      });
    }

    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ message: "Invalid email or password" })
  }

  @Post('register')
  async register(@Res() res: any, @Body() body: RegisterDto) {
    const findUser = await this.userService.getByEmail(body.email.trim());

    if (findUser) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: 'User is already exist' });
    }

    const user = await this.userService.registerUser({
      email: body.email,
      password: body.password,
      name: body.name,
      surname: body.surname,
      phone: body.phone,
    });

    if (user) {
      const tokenPair = await this.authService.generateTokenPair(user.id);

      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(HttpStatus.OK).json({
        accessToken: tokenPair.accessToken,
      });
    }

    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: "ERROR.Failed_to_register_user" });
  }


  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    console.log('Refresh token from cookie:', refreshToken);

    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Missing refresh token' });
    }

    try {
      const tokenPair = await this.authService.refreshTokens(refreshToken);

      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ accessToken: tokenPair.accessToken });
    } catch (e) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: e.message });
    }
  }
}
