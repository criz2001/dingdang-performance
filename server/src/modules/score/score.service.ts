import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentItem } from '../../entities/assessment-item.entity';
import { Score } from '../../entities/score.entity';
import {
  calculateItemFinalScore,
  scoreToLevel,
} from './score-calculator';

/**
 * 评分管理服务
 */
@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(AssessmentItem)
    private readonly itemRepository: Repository<AssessmentItem>,
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
  ) {}

  /**
   * 提交评分
   * @param assessmentItemId 考核明细项ID
   * @param scoreType 评分类型: manager/self
   * @param scoreValue 评分值
   * @param comment 评语
   * @param operatorId 操作人ID
   */
  async submitScore(
    assessmentItemId: number,
    scoreType: string,
    scoreValue: number,
    comment: string | undefined,
    operatorId: number,
  ) {
    if (!['manager', 'self'].includes(scoreType)) {
      throw new BadRequestException('评分类型无效，只能为 manager 或 self');
    }
    if (scoreValue < 0 || scoreValue > 100) {
      throw new BadRequestException('评分必须在 0-100 之间');
    }

    const item = await this.itemRepository.findOne({ where: { id: assessmentItemId } });
    if (!item) {
      throw new NotFoundException('考核明细项不存在');
    }

    // 创建评分记录
    const score = this.scoreRepository.create({
      assessmentItemId,
      scoreType,
      score: scoreValue,
      comment: comment ?? undefined,
      createdBy: operatorId,
    });
    await this.scoreRepository.save(score);

    // 更新考核明细项中的评分字段
    const updateField: Record<string, any> = {};
    if (scoreType === 'manager') {
      updateField.managerScore = scoreValue;
      updateField.managerComment = comment || null;
    } else {
      updateField.selfScore = scoreValue;
      updateField.selfComment = comment || null;
    }

    // 如果两个评分都已提交，计算最终得分
    const mgrFinal = scoreType === 'manager' ? scoreValue : item.managerScore;
    const selfFinal = scoreType === 'self' ? scoreValue : item.selfScore;

    if (mgrFinal !== null && selfFinal !== null) {
      const finalScore = calculateItemFinalScore(
        mgrFinal,
        selfFinal,
        item.managerWeight,
        item.selfWeight,
      );
      updateField.finalScore = finalScore;
      updateField.level = scoreToLevel(finalScore);
    }

    await this.itemRepository.update(assessmentItemId, updateField);
    return this.itemRepository.findOne({ where: { id: assessmentItemId } });
  }

  /**
   * 查询指定考核明细项的评分记录
   */
  async getScores(assessmentItemId: number) {
    return this.scoreRepository.find({
      where: { assessmentItemId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 查询指定考核的所有评分
   */
  async getAssessmentScores(assessmentId: number) {
    const items = await this.itemRepository.find({
      where: { assessmentId },
      order: { id: 'ASC' },
    });

    const result: any[] = [];
    for (const item of items) {
      const scores = await this.scoreRepository.find({
        where: { assessmentItemId: item.id },
        order: { createdAt: 'ASC' },
      });
      result.push({ item, scores });
    }
    return result;
  }
}
