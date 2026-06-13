import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DeptService } from './dept.service';
import { CreateDeptDto, UpdateDeptDto } from './dept.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * 部门管理控制器
 */
@Controller('dept')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @Get()
  async findAll() {
    return this.deptService.findAll();
  }

  @Get('list')
  async findAllFlat() {
    return this.deptService.findAllFlat();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.deptService.findOne(+id);
  }

  @Post()
  @Roles('chairman', 'hr')
  async create(@Body() dto: CreateDeptDto) {
    return this.deptService.create(dto);
  }

  @Put(':id')
  @Roles('chairman', 'hr')
  async update(@Param('id') id: string, @Body() dto: UpdateDeptDto) {
    return this.deptService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('chairman', 'hr')
  async remove(@Param('id') id: string) {
    return this.deptService.remove(+id);
  }
}
