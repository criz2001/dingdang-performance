import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from '../../entities/assessment.entity';
import { AssessmentItem } from '../../entities/assessment-item.entity';
import { User } from '../../entities/user.entity';
import { Department } from '../../entities/dept.entity';
import { calculateAssessmentScore, scoreToLevel } from '../score/score-calculator';
import { NODE_STATUS_MAP } from '../flow/flow.config';

/**
 * 报告统计服务
 */
@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Assessment)
    private readonly assessmentRepository: Repository<Assessment>,
    @InjectRepository(AssessmentItem)
    private readonly assessmentItemRepository: Repository<AssessmentItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly deptRepository: Repository<Department>,
  ) {}

  /**
   * 部门绩效汇总
   */
  async deptSummary(month?: string) {
    const qb = this.assessmentRepository.createQueryBuilder('a');
    if (month) qb.andWhere('a.month = :month', { month });

    const assessments = await qb.getMany();
    const depts = await this.deptRepository.find({ where: { status: 1 } });
    const deptMap = new Map(depts.map(d => [d.id, d]));

    const summary: any[] = [];
    for (const assessment of assessments) {
      const items = await this.assessmentItemRepository.find({
        where: { assessmentId: assessment.id },
      });
      const scores = items
        .filter(i => i.finalScore !== null)
        .map(i => ({ finalScore: i.finalScore!, weight: i.weight }));
      const totalScore = calculateAssessmentScore(scores);
      const dept = deptMap.get(assessment.deptId);

      summary.push({
        assessmentId: assessment.id,
        deptId: assessment.deptId,
        deptName: dept?.name || '未知部门',
        month: assessment.month,
        title: assessment.title,
        status: assessment.status,
        statusName: NODE_STATUS_MAP[assessment.status] || assessment.status,
        itemCount: items.length,
        scoredCount: scores.length,
        totalScore,
        level: scoreToLevel(totalScore),
      });
    }

    return summary.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * 个人绩效报告
   */
  async userReport(userId: number, month?: string) {
    const qb = this.assessmentItemRepository.createQueryBuilder('ai')
      .where('ai.userId = :userId', { userId });

    if (month) {
      qb.innerJoinAndSelect(
        Assessment, 'a', 'a.id = ai.assessmentId AND a.month = :month', { month },
      );
    }

    const items = await qb.getMany();
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const assessmentIds = [...new Set(items.map(i => i.assessmentId))];
    const assessments = await this.assessmentRepository.findByIds(assessmentIds);

    const report: any[] = [];
    for (const assessment of assessments) {
      const userItems = items.filter(i => i.assessmentId === assessment.id);
      const scores = userItems
        .filter(i => i.finalScore !== null)
        .map(i => ({ finalScore: i.finalScore!, weight: i.weight }));
      const totalScore = calculateAssessmentScore(scores);

      report.push({
        assessmentId: assessment.id,
        title: assessment.title,
        month: assessment.month,
        status: assessment.status,
        statusName: NODE_STATUS_MAP[assessment.status] || assessment.status,
        itemCount: userItems.length,
        scoredCount: scores.length,
        totalScore,
        level: scoreToLevel(totalScore),
        items: userItems,
      });
    }

    return {
      user: user ? { id: user.id, name: user.name, deptId: user.deptId, role: user.role } : null,
      reports: report.sort((a, b) => b.month.localeCompare(a.month)),
    };
  }

  /**
   * 全公司绩效排行
   */
  async companyRanking(month: string) {
    const assessments = await this.assessmentRepository.find({
      where: { month },
    });

    const rankings: any[] = [];
    for (const assessment of assessments) {
      const items = await this.assessmentItemRepository.find({
        where: { assessmentId: assessment.id },
      });

      // 按用户分组
      const userGroups = new Map<number, AssessmentItem[]>();
      for (const item of items) {
        const group = userGroups.get(item.userId) || [];
        group.push(item);
        userGroups.set(item.userId, group);
      }

      const dept = await this.deptRepository.findOne({ where: { id: assessment.deptId } });

      for (const [userId, userItems] of userGroups) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const scoredItems = userItems.filter(i => i.finalScore !== null);
        if (scoredItems.length === 0) continue;

        const totalScore = calculateAssessmentScore(
          scoredItems.map(i => ({ finalScore: i.finalScore!, weight: i.weight })),
        );

        rankings.push({
          userId,
          userName: user?.name || '未知',
          deptName: dept?.name || '未知',
          totalScore,
          level: scoreToLevel(totalScore),
          itemCount: userItems.length,
          scoredCount: scoredItems.length,
        });
      }
    }

    return rankings.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * 等级分布统计
   */
  async levelDistribution(month: string) {
    const assessments = await this.assessmentRepository.find({
      where: { month },
    });

    const distribution = { S: 0, A: 0, B: 0, C: 0, D: 0 };

    for (const assessment of assessments) {
      const items = await this.assessmentItemRepository.find({
        where: { assessmentId: assessment.id },
      });

      // 按用户分组取平均
      const userGroups = new Map<number, AssessmentItem[]>();
      for (const item of items) {
        const group = userGroups.get(item.userId) || [];
        group.push(item);
        userGroups.set(item.userId, group);
      }

      for (const [, userItems] of userGroups) {
        const scoredItems = userItems.filter(i => i.finalScore !== null);
        if (scoredItems.length === 0) continue;
        const totalScore = calculateAssessmentScore(
          scoredItems.map(i => ({ finalScore: i.finalScore!, weight: i.weight })),
        );
        const level = scoreToLevel(totalScore) as keyof typeof distribution;
        distribution[level]++;
      }
    }

    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    return { distribution, total };
  }

  /**
   * 月度趋势分析
   */
  async monthlyTrend(startMonth: string, endMonth: string) {
    const assessments = await this.assessmentRepository.createQueryBuilder('a')
      .where('a.month >= :startMonth AND a.month <= :endMonth', { startMonth, endMonth })
      .orderBy('a.month', 'ASC')
      .getMany();

    const trend: any[] = [];
    const monthMap = new Map<string, number[]>();

    for (const assessment of assessments) {
      const items = await this.assessmentItemRepository.find({
        where: { assessmentId: assessment.id },
      });

      for (const item of items) {
        if (item.finalScore === null) continue;
        const scores = monthMap.get(assessment.month) || [];
        scores.push(item.finalScore);
        monthMap.set(assessment.month, scores);
      }
    }

    for (const [month, scores] of monthMap) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      trend.push({
        month,
        avgScore: Math.round(avg * 100) / 100,
        userCount: scores.length,
        maxScore: Math.max(...scores),
        minScore: Math.min(...scores),
      });
    }

    return trend.sort((a, b) => a.month.localeCompare(b.month));
  }
}
