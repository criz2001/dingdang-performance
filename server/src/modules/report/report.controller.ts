import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportQueryDto } from './report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * 报告统计控制器
 */
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * 部门绩效汇总
   */
  @Get('dept-summary')
  async deptSummary(@Query() query: ReportQueryDto) {
    return this.reportService.deptSummary(query.month);
  }

  /**
   * 个人绩效报告
   */
  @Get('user-report')
  async userReport(@Query() query: ReportQueryDto) {
    return this.reportService.userReport(query.userId || 1, query.month);
  }

  /**
   * 全公司绩效排行
   */
  @Get('ranking')
  async ranking(@Query() query: ReportQueryDto) {
    return this.reportService.companyRanking(query.month || new Date().toISOString().slice(0, 7));
  }

  /**
   * 等级分布统计
   */
  @Get('level-distribution')
  async levelDistribution(@Query() query: ReportQueryDto) {
    return this.reportService.levelDistribution(query.month || new Date().toISOString().slice(0, 7));
  }

  /**
   * 月度趋势分析
   */
  @Get('monthly-trend')
  async monthlyTrend(@Query() query: ReportQueryDto) {
    const end = query.endMonth || new Date().toISOString().slice(0, 7);
    const start = query.startMonth || '2024-01';
    return this.reportService.monthlyTrend(start, end);
  }
}
