import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll(@Req() req: any, @Res() res: any) {
    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.usersService.getAll());
  }

  @Post()
  async createUser(
    @Req() req: any,
    @Res() res: any,
    @Body() body: CreateUserDto,
  ) {
    return res
      .status(HttpStatus.CREATED)
      .json(await this.usersService.createUser(body));
  }

  @ApiParam({ name: 'userId', required: true })
  @Get('/:userId')
  async getById(
    @Req() req: any,
    @Res() res: any,
    @Param('userId') userId: number,
  ) {
    return res
      .status(HttpStatus.FOUND)
      .json(await this.usersService.getById(userId));
  }

  @ApiParam({ name: 'userId', required: true })
  @Delete('/:userId')
  async deleteUser(
    @Req() req: any,
    @Res() res: any,
    @Param('userId') userId: number,
  ) {
    return res
      .status(HttpStatus.OK)
      .json(await this.usersService.deleteUser(userId));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        oldPassword: { type: 'string' },
        newPassword: { type: 'string' },
      },
      required: ['oldPassword', 'newPassword'],
    },
  })
  @Post('/changePassword')
  async changePassword(
    @Req() req: any,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
    @Res() res: any,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'User not authenticated' });
    }

    return res
      .status(HttpStatus.ACCEPTED)
      .json(
        await this.usersService.changePassword(
          userId,
          oldPassword,
          newPassword,
        ),
      );
  }

  @ApiParam({ name: 'userId', required: true })
  @Patch('/:userId')
  async updateUser(
    @Req() req: any,
    @Res() res: any,
    @Param('userId') userId: number,
    @Body() body: UpdateUserDto,
  ) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.usersService.updateUser(userId, body));
  }
}
