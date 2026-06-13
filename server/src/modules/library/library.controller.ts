import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LibraryService } from './library.service';
import { CreateLibraryDto, UpdateLibraryDto, LibraryQueryDto } from './library.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * 绩效库管理控制器
 */
@Controller('library')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  async findAll(@Query() query: LibraryQueryDto) {
    return this.libraryService.findAll(query);
  }

  @Get('categories')
  async getCategories() {
    return this.libraryService.getCategories();
  }

  @Get('type/:type')
  async findByType(@Param('type') type: string) {
    return this.libraryService.findByType(type);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.libraryService.findOne(+id);
  }

  @Post()
  @Roles('chairman', 'hr')
  async create(@Body() dto: CreateLibraryDto) {
    return this.libraryService.create(dto);
  }

  @Put(':id')
  @Roles('chairman', 'hr')
  async update(@Param('id') id: string, @Body() dto: UpdateLibraryDto) {
    return this.libraryService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('chairman', 'hr')
  async remove(@Param('id') id: string) {
    return this.libraryService.remove(+id);
  }
}
