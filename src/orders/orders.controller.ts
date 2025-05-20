import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { OrderDto } from './dto/order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
}
