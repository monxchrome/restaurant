import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch, Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { DRYFileName, imageFileFilter } from '../core/file-upload/file-upload';
import { CreateMenuItemDto } from './dto/menuItem.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('MenuItem')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  async getAll(@Req() req: any, @Res() res: any) {
    return res.status(HttpStatus.ACCEPTED).json(await this.menuService.getAll())
  }

  @ApiParam({ name: 'menuId', required: true })
  @Get('/:menuId')
  async getById(
    @Req() req: any,
    @Res() res: any,
    @Param('menuId') menuId: number
  ) {
    return res
      .status(HttpStatus.FOUND)
      .json(await this.menuService.getById(menuId))
  }

  @ApiParam({ name: 'menuId', required: true })
  @Delete('/:menuId')
  async deleteMenuItem(
    @Req() req: any,
    @Res() res: any,
    @Param('menuId') menuId: number
  ) {
    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.menuService.deleteMenuItem(menuId))
  }


  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'image', maxCount: 1 }],
      {
        storage: diskStorage({
          destination: './public/menuItems',
          filename: DRYFileName,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  async createMenuItem(
    @Req() req: any,
    @Res() res: any,
    @Body() body: CreateMenuItemDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    if (files?.image?.[0]) {
      body.image = `/public/menuItems/${files.image[0].filename}`;
    }

    return res
      .status(HttpStatus.CREATED)
      .json(await this.menuService.createMenuItem(body));
  }

  @ApiParam({ name: 'menuId', required: true })
  @Patch('/:menuId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './public/menuItems',
          filename: DRYFileName,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  async updateMenuItem(
    @Req() req: any,
    @Res() res: any,
    @Param('menuId') menuId: number,
    @Body() body: CreateMenuItemDto,
    @UploadedFiles()  files: { image?: Express.Multer.File[] },
  ) {
    if (files?.image) {
      body.image = `/public/menuItems/${files[0].filename}`;
    }

    return res
      .status(HttpStatus.ACCEPTED)
      .json(await this.menuService.updateMenuItem(menuId, body))
  }
}
