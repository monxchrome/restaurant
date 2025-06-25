import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

enum Category {
  SALADS_AND_SNACKS = 'SALADS_AND_SNACKS',
  SOUPS = 'SOUPS',
  GRILL_DISHES = 'GRILL_DISHES',
  MAIN_HOT_DISHES = 'MAIN_HOT_DISHES',
  PIZZA_AND_PIES = 'PIZZA_AND_PIES',
  DESSERTS = 'DESSERTS',
  DRINKS = 'DRINKS',
  EXTRAS = 'EXTRAS',
}

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Цезарь с курицей', description: 'Название блюда' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Салат с курицей, пармезаном и соусом Цезарь',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 350, description: 'Цена блюда в рублях' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => Number(value))
  price: number;

  @ApiProperty({ example: 'image.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    enum: Category,
    default: Category.EXTRAS,
    description: 'Категория блюда',
  })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  visible?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  inStock?: boolean;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional({ example: 'Цезарь с курицей' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Салат с курицей, пармезаном и соусом Цезарь',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 350 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  price?: number;

  @ApiPropertyOptional({ example: 'image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ enum: Category, default: Category.EXTRAS })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  visible?: boolean;

  @ApiPropertyOptional({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  inStock?: boolean;
}
