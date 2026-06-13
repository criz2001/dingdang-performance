import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ScoreService } from './score.service';
import { SubmitScoreDto } from './score.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 评分管理控制器
 */
@Controller('scores')
@UseGuards(JwtAuthGuard)
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  /**
   * 提交评分（经理评分或自评）
   */
  @Post('submit')
  async submitScore(
    @Body() dto: SubmitScoreDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.scoreService.submitScore(
      dto.assessmentItemId,
      dto.scoreType,
      dto.score,
      dto.comment,
      user.id,
    );
  }

  /**
   * 查询指定考核明细项的评分记录
   */
  @Get('item/:assessmentItemId')
  async getScores(@Param('assessmentItemId') id: string) {
    return this.scoreService.getScores(+id);
  }

  /**
   * 查询指定考核的所有评分
   */
  @Get('assessment/:assessmentId')
  async getAssessmentScores(@Param('assessmentId') id: string) {
    return this.scoreService.getAssessmentScores(+id);
  }
}
