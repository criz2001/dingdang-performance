import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinanceDto, BatchImportFinanceDto, FinanceQueryDto, LinkLibraryDto } from './finance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * 财务数据管理控制器
 */
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  async findAll(@Query() query: FinanceQueryDto) {
    return this.financeService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.financeService.findOne(+id);
  }

  @Post()
  @Roles('chairman', 'finance')
  async create(@Body() dto: CreateFinanceDto) {
    return this.financeService.create(dto);
  }

  @Post('batch-import')
  @Roles('chairman', 'finance')
  async batchImport(@Body() dto: BatchImportFinanceDto) {
    return this.financeService.batchImport(dto.items);
  }

  @Put(':id')
  @Roles('chairman', 'finance')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateFinanceDto>) {
    return this.financeService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('chairman', 'finance')
  async remove(@Param('id') id: string) {
    return this.financeService.remove(+id);
  }

  /**
   * 关联财务数据到绩效库项
   */
  @Post(':id/link')
  @Roles('chairman', 'finance')
  async linkLibraryItem(
    @Param('id') id: string,
    @Body() dto: LinkLibraryDto,
  ) {
    return this.financeService.linkLibraryItem(+id, dto.libraryItemId);
  }

  /**
   * 按部门和月份查询财务数据
   */
  @Get('dept/:deptId/month/:month')
  async findByDeptAndMonth(
    @Param('deptId') deptId: string,
    @Param('month') month: string,
  ) {
    return this.financeService.findByDeptAndMonth(+deptId, month);
  }
}
