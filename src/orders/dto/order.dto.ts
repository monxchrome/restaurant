import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const NAME_REGEX = /^[A-Za-zА-Яа-яЁё\s'-]+$/; // разрешаем буквы, пробел, апостроф и дефис

export class OrderItemDto {
  @ApiProperty()
  @IsNumber()
  menuItemId: number;

  @ApiProperty()
  @IsNumber()
  @Min(1, { message: 'Количество должно быть не меньше 1' })
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(NAME_REGEX, { message: 'Имя содержит недопустимые символы' })
  @MaxLength(50)
  clientName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(NAME_REGEX, { message: 'Фамилия содержит недопустимые символы' })
  @MaxLength(50)
  clientSurname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('RU', { message: 'Некорректный формат телефона' })
  clientPhone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  deliveryAddress?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  waiterId?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
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
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(NAME_REGEX, { message: 'Имя содержит недопустимые символы' })
  @MaxLength(50)
  clientName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(NAME_REGEX, { message: 'Фамилия содержит недопустимые символы' })
  @MaxLength(50)
  clientSurname?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsPhoneNumber('RU', { message: 'Некорректный формат телефона' })
  clientPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  deliveryAddress?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  waiter?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @ApiPropertyOptional({ type: [UpdateOrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  @IsOptional()
  items?: UpdateOrderItemDto[];
}