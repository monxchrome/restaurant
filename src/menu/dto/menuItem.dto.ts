import { ApiProperty } from '@nestjs/swagger';
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
  image?: string;
}
