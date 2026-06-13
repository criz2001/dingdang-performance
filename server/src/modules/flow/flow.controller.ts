import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { FlowService } from './flow.service';
import { FlowActionDto, FlowRollbackDto } from './flow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 流程引擎控制器
 */
@Controller('flow')
@UseGuards(JwtAuthGuard)
export class FlowController {
  constructor(private readonly flowService: FlowService) {}

  /**
   * 获取流程节点定义
   */
  @Get('nodes')
  async getFlowNodes() {
    return this.flowService.getFlowNodes();
  }

  /**
   * 提交流程到下一节点
   */
  @Post('submit')
  async submit(
    @Body() dto: FlowActionDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.flowService.submit(dto.assessmentId, user.id, user.role, dto.remark);
  }

  /**
   * 回退流程到指定节点
   */
  @Post('rollback')
  async rollback(
    @Body() dto: FlowRollbackDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.flowService.rollback(dto.assessmentId, dto.targetNode, user.id, user.role, dto.remark);
  }

  /**
   * 获取指定考核的流程日志
   */
  @Get('logs/:assessmentId')
  async getFlowLogs(@Param('assessmentId') assessmentId: string) {
    return this.flowService.getFlowLogs(+assessmentId);
  }
}
