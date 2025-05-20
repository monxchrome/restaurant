import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  menuItemId: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;
}

export class OrderDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  clientSurname: string;

  @ApiProperty()
  clientPhone: string;

  @ApiProperty()
  deliveryAddress: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty({ required: false, nullable: true })
  waiterId?: number;

  @ApiProperty({ type: [OrderItemDto] })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
