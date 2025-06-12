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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { imageFileFilter } from '../core/file-upload/file-upload';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menuItem.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { GcsService } from '../common/services/gcs.service';

@ApiTags('MenuItem')
@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly gcsService: GcsService,
  ) {}

  @Get()
  async getAll(
    @Req() req: any,
    @Res() res: any,
    @Query('category') category?: string,
    @Query('visible') visible?: string,
    @Query('inStock') inStock?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: 'name' | 'price' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.menuService.getAll({
      category,
      visible:
        visible === 'true' ? true : visible === 'false' ? false : undefined,
      inStock:
        inStock === 'true' ? true : inStock === 'false' ? false : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      sortOrder,
    });

    return res.status(HttpStatus.OK).json(result);
  }

  @ApiParam({ name: 'menuId', required: true })
  @Get('/:menuId')
  async getById(
    @Req() req: any,
    @Res() res: any,
    @Param('menuId') menuId: number,
  ) {
    return res
      .status(HttpStatus.FOUND)
      .json(await this.menuService.getById(menuId));
  }

  @ApiParam({ name: 'menuId', required: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('/:menuId')
  async deleteMenuItem(
    @Req() req: any,
    @Res() res: any,
    @Param('menuId') menuId: number,
  ) {
    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.menuService.deleteMenuItem(menuId));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
      storage: memoryStorage(),
      fileFilter: imageFileFilter,
    }),
  )
  async createMenuItem(
    @Req() req: any,
    @Res() res: any,
    @Body() body: CreateMenuItemDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    if (files?.image?.[0]) {
      body.imageUrl = await this.gcsService.uploadFile(
        files.image[0],
        'menuItems',
      );
    }

    return res
      .status(HttpStatus.CREATED)
      .json(await this.menuService.createMenuItem(body));
  }

  @ApiParam({ name: 'menuId', required: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('/:menuId')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
      storage: memoryStorage(),
      fileFilter: imageFileFilter,
    }),
  )
  async updateMenuItem(
    @Req() req: any,
    @Res() res: any,
    @Param('menuId') menuId: number,
    @Body() body: UpdateMenuItemDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    if (files?.image?.[0]) {
      body.imageUrl = await this.gcsService.uploadFile(
        files.image[0],
        'menuItems',
      );
    }

    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.menuService.updateMenuItem(menuId, body));
  }
}
