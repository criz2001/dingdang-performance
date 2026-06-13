import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AssessService } from './assess.service';
import { CreateAssessmentDto, UpdateAssessmentDto, AssessmentQueryDto, AddAssessmentItemDto, LaunchAssessmentDto } from './assess.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 月度考核管理控制器
 */
@Controller('assess')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessController {
  constructor(private readonly assessService: AssessService) {}

  @Get()
  async findAll(@Query() query: AssessmentQueryDto) {
    return this.assessService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assessService.findOne(+id);
  }

  @Post()
  @Roles('chairman', 'hr', 'manager')
  async create(
    @Body() dto: CreateAssessmentDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.assessService.create(dto, userId);
  }

  @Put(':id')
  @Roles('chairman', 'hr')
  async update(@Param('id') id: string, @Body() dto: UpdateAssessmentDto) {
    return this.assessService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('chairman', 'hr')
  async remove(@Param('id') id: string) {
    return this.assessService.remove(+id);
  }

  // 考核明细项管理
  @Get(':id/items')
  async getItems(@Param('id') id: string) {
    return this.assessService.getItems(+id);
  }

  @Post(':id/items')
  @Roles('chairman', 'hr', 'manager')
  async addItem(@Param('id') id: string, @Body() dto: AddAssessmentItemDto) {
    return this.assessService.addItems(+id, dto);
  }

  @Delete('items/:itemId')
  @Roles('chairman', 'hr')
  async removeItem(@Param('itemId') itemId: string) {
    return this.assessService.removeItem(+itemId);
  }

  @Post(':id/recalculate')
  @Roles('chairman', 'hr', 'manager')
  async recalculate(@Param('id') id: string) {
    return this.assessService.recalculateScore(+id);
  }

  // 月度选取相关接口
  @Get('selections/:month')
  async getSelections(@Param('month') month: string) {
    return this.assessService.getSelections(month);
  }

  @Post('selections')
  @Roles('chairman', 'hr', 'manager')
  async saveSelections(@Body() body: { month: string; items: any[] }) {
    return this.assessService.saveSelections(body.month, body.items);
  }

  // 下发考核接口
  @Post('launch')
  @Roles('chairman', 'hr')
  async launch(
    @Body() dto: LaunchAssessmentDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.assessService.launchAssessment(dto, userId);
  }
}
