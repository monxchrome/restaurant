import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @ApiProperty()
  @IsNumber()
  menuItemId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientSurname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientPhone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  waiterId?: number;

  @ApiProperty()
  @IsNumber()
  totalPrice: number;


  @ApiProperty({ enum: OrderStatus, default: OrderStatus.PENDING, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({ type: [OrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1)
  items: OrderItemDto[];
}

export class UpdateOrderItemDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  menuItemId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;
}

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientSurname?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  waiter?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @ApiPropertyOptional({ type: [UpdateOrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  @IsOptional()
  items?: UpdateOrderItemDto[];
}