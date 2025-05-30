import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { OrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Req() req: any, @Res() res: any) {
    return res.status(HttpStatus.ACCEPTED).json(await this.ordersService.getAll());
  }

  @ApiParam({ name: 'orderId', required: true })
  @Get('/:orderId')
  async getById(
    @Req() req: any,
    @Res() res: any,
    @Param('orderId') orderId: number) {
    return res
      .status(HttpStatus.FOUND)
      .json(await this.ordersService.getById(orderId))
  }

  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'orderId', required: true })
  @Delete('/:orderId')
  async deleteById(
    @Req() req: any,
    @Res() res: any,
    @Param('orderId') orderId: number) {
    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.ordersService.deleteOrder(orderId))
  }

  @Post()
  async createOrder(@Req() req: any, @Res() res: any, @Body() body: OrderDto) {
    return res
      .status(HttpStatus.CREATED)
      .json(await this.ordersService.create(body))
  }

  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'orderId', required: true })
  @Patch('/:orderId')
  async updateOrder(
    @Req() req: any,
    @Res() res: any,
    @Param('orderId') orderId: number,
    @Body() body: OrderDto) {

    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.ordersService.updateOrder(orderId, body))
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/status')
  async ordersCountByStatus(
    @Res() res: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.ordersService.getOrdersCountByStatus(startDate, endDate);
    return res.status(HttpStatus.OK).json(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/count-by-day')
  async ordersCountByDay(
    @Res() res: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.ordersService.getOrdersCountByDay(startDate, endDate);
    return res.status(HttpStatus.OK).json(data);
  }


  @UseGuards(JwtAuthGuard)
  @Get('stats/revenue-by-day')
  async revenueByDay(
    @Res() res: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.ordersService.getRevenueByDay(startDate, endDate);
    return res.status(HttpStatus.OK).json(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/average-check')
  async averageCheck(
    @Res() res: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const avg = await this.ordersService.getAverageCheck(startDate, endDate);
    return res.status(HttpStatus.OK).json({ averageCheck: avg });
  }
}
