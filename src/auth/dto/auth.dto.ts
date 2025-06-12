import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'User password',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (min 6 symbols)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User name',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User surname',
  })
  @IsNotEmpty()
  surname: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
  })
  @Matches(/^\+\d{10,15}$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({
    example: 'WAITER',
    description: 'User role',
    enum: Role,
    default: Role.WAITER,
  })
  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  secret?: string;
}
