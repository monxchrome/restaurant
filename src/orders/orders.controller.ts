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
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getAll(@Query('page') page = '1', @Query('pageSize') pageSize = '10', @Res() res) {
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    const result = await this.ordersService.getAll(pageNum, pageSizeNum);
    return res.status(HttpStatus.OK).json(result);
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
  async createOrder(@Req() req: any, @Res() res: any, @Body() body: CreateOrderDto) {
    try {
      const order = await this.ordersService.create(body);
      return res.status(HttpStatus.CREATED).json(order);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'orderId', required: true })
  @Patch('/:orderId')
  async updateOrder(
    @Req() req: any,
    @Res() res: any,
    @Param('orderId') orderId: number,
    @Body() body: UpdateOrderDto) {

    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.ordersService.updateOrder(orderId, body))
  }

  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'orderId', required: true })
  @Patch('/:orderId/status')
  async updateOrderStatus(
    @Req() req: any,
    @Res() res: any,
    @Param('orderId') orderId: number,
    @Body() body: UpdateOrderDto) {

    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.ordersService.updateOrderStatus(orderId, body))
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

    const transformed = data.map(item => ({
      ...item,
      count: typeof item.count === 'bigint' ? Number(item.count) : item.count,
    }));

    return res.status(HttpStatus.OK).json(transformed);
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

  @UseGuards(JwtAuthGuard)
  @Get('stats/summary')
  async getSummaryStats(
    @Res() res: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.ordersService.getSummaryStats(startDate, endDate);
    return res.status(HttpStatus.OK).json(data);
  }

}
