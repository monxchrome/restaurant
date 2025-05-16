import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';

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
      const token = await this.authService.signIn(findUser.id.toString());
      return res.status(HttpStatus.OK).json({ token })
    }

    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ message: "Invalid email or password" })
  }

  @Post('register')
  async register(@Res() res: any, @Body() body: RegisterDto) {
    let findUser;
    try {
      findUser = await this.userService.getByEmail(body.email.trim());
    } catch (e) {
      console.log(e)
    }

    if (!findUser) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: 'User is already exist' })
    }

    const user = await this.userService.registerUser({
      email: body.email,
      password: body.password,
      name: body.name,
      surname: body.surname,
      phone: body.phone,
    });

    if (user) {
      const token = await this.authService.signIn(findUser.id.toString());

      return res.status(HttpStatus.OK).json({ token })
    }

    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: "ERROR.Failed_to_register_user" })
  }
}
