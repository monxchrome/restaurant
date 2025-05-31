import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Цезарь с курицей', description: 'Название блюда' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Салат с курицей, пармезаном и соусом Цезарь', description: 'Описание блюда', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 350, description: 'Цена блюда в рублях' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 'image.jpg', description: 'Фото блюда', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional({ example: 'Цезарь с курицей' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Салат с курицей, пармезаном и соусом Цезарь' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 350 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ example: 'image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

