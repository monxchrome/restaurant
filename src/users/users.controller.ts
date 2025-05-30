import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/user.dto';
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
      .json(await this.usersService.getAll())
  }

  @Post()
  async createUser(
    @Req() req: any,
    @Res() res: any,
    @Body() body: CreateUserDto
  ) {
    return res
      .status(HttpStatus.CREATED)
      .json(await this.usersService.createUser(body))
  }

  @ApiParam({name: 'userId', required: true})
  @Get('/:userId')
  async getById(
    @Req() req: any,
    @Res() res: any,
    @Param('userId') userId: number
  ) {
    return res
      .status(HttpStatus.FOUND)
      .json(await this.usersService.getById(userId))
  }

  @ApiParam({name: 'userId', required: true})
  @Delete('/:userId')
  async deleteUser(
    @Req() req: any,
    @Res() res: any,
    @Param('userId') userId: number
  ) {
    return res
      .status(HttpStatus.FOUND)
      .json(await this.usersService.deleteUser(userId))
  }

  @ApiParam({name: 'userId', required: true})
  @Patch('/:userId')
  async updateUser(
    @Req() req: any,
    @Res() res: any,
    @Param('userId') userId: number,
    @Body() body: CreateUserDto
  ) {
    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.usersService.updateUser(userId, body))
  }
}
