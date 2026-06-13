import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Assessment } from '../../entities/assessment.entity';
import { AssessmentItem } from '../../entities/assessment-item.entity';
import { User } from '../../entities/user.entity';
import { LibraryItem } from '../../entities/library.entity';
import {
  calculateItemFinalScore,
  calculateAssessmentScore,
  scoreToLevel,
} from '../../modules/score/score-calculator';
import { CreateAssessmentDto, UpdateAssessmentDto, AssessmentQueryDto, AddAssessmentItemDto, LaunchAssessmentDto } from './assess.dto';

/**
 * 月度考核管理服务
 */
@Injectable()
export class AssessService {
  constructor(
    @InjectRepository(Assessment)
    private readonly assessmentRepository: Repository<Assessment>,
    @InjectRepository(AssessmentItem)
    private readonly assessmentItemRepository: Repository<AssessmentItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LibraryItem)
    private readonly libraryRepository: Repository<LibraryItem>,
  ) {}

  /**
   * 查询考核列表
   */
  async findAll(query: AssessmentQueryDto) {
    const { page = 1, pageSize = 20, month, deptId, status, keyword } = query;
    const qb = this.assessmentRepository.createQueryBuilder('a');

    if (month) qb.andWhere('a.month = :month', { month });
    if (deptId) qb.andWhere('a.deptId = :deptId', { deptId });
    if (status) qb.andWhere('a.status = :status', { status });
    if (keyword) {
      qb.andWhere('a.title LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const skip = (page - 1) * pageSize;
    const [list, total] = await qb
      .skip(skip)
      .take(pageSize)
      .orderBy('a.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 查询单个考核详情（含明细项）
   */
  async findOne(id: number) {
    const assessment = await this.assessmentRepository.findOne({ where: { id } });
    if (!assessment) throw new NotFoundException('考核不存在');
    
    const items = await this.assessmentItemRepository.find({
      where: { assessmentId: id },
    });

    return { ...assessment, items };
  }

  /**
   * 创建月度考核
   */
  async create(dto: CreateAssessmentDto, createdBy: number) {
    const { deptId, month, itemConfigs } = dto;

    // 检查该月份该部门是否已有考核
    const existing = await this.assessmentRepository.findOne({
      where: { month, deptId },
    });
    if (existing) {
      throw new BadRequestException('该部门该月份已存在考核');
    }

    // 创建考核主表
    const title = dto.title || `${month}月度绩效考评 - ${deptId}`;
    const assessment = this.assessmentRepository.create({
      title,
      month,
      deptId,
      status: 'N1',
      startDate: dto.startDate || '',
      endDate: dto.endDate || '',
      createdBy,
    });
    const saved: Assessment = await this.assessmentRepository.save(assessment);

    // 如果传入了考核配置，创建明细项
    if (itemConfigs && itemConfigs.length > 0) {
      const items: any[] = [];
      for (const config of itemConfigs) {
        // 获取部门员工
        const users = await this.userRepository.find({
          where: { deptId, status: 1 },
        });
        for (const user of users) {
          // 查找对应的绩效库项
          if (config.libraryItemIds && config.libraryItemIds.length > 0) {
            for (const libId of config.libraryItemIds) {
              items.push({
                assessmentId: saved.id,
                userId: user.id,
                libraryItemId: libId,
                weight: config.weight || 10,
                managerWeight: config.managerWeight || 70,
                selfWeight: config.selfWeight || 30,
              });
            }
          }
        }
      }
      if (items.length > 0) {
        await this.assessmentItemRepository.save(
          this.assessmentItemRepository.create(items),
        );
      }
    }

    return this.findOne(saved.id);
  }

  /**
   * 更新考核信息
   */
  async update(id: number, dto: UpdateAssessmentDto) {
    const assessment = await this.assessmentRepository.findOne({ where: { id } });
    if (!assessment) throw new NotFoundException('考核不存在');
    await this.assessmentRepository.update(id, dto as any);
    return this.findOne(id);
  }

  /**
   * 删除考核
   */
  async remove(id: number) {
    const assessment = await this.assessmentRepository.findOne({ where: { id } });
    if (!assessment) throw new NotFoundException('考核不存在');
    // 级联删除明细项
    await this.assessmentItemRepository.delete({ assessmentId: id });
    await this.assessmentRepository.delete(id);
    return { id };
  }

  /**
   * 为考核添加明细项
   */
  async addItems(assessmentId: number, dto: AddAssessmentItemDto) {
    const assessment = await this.assessmentRepository.findOne({ where: { id: assessmentId } });
    if (!assessment) throw new NotFoundException('考核不存在');

    const { userId, libraryItemId, weight, managerWeight, selfWeight } = dto;
    const item = this.assessmentItemRepository.create({
      assessmentId,
      userId,
      libraryItemId,
      weight: weight || 10,
      managerWeight: managerWeight || 70,
      selfWeight: selfWeight || 30,
    });
    return this.assessmentItemRepository.save(item);
  }

  /**
   * 查询考核明细项列表
   */
  async getItems(assessmentId: number) {
    return this.assessmentItemRepository.find({
      where: { assessmentId },
      order: { id: 'ASC' },
    });
  }

  /**
   * 删除考核明细项
   */
  async removeItem(itemId: number) {
    const item = await this.assessmentItemRepository.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('考核明细项不存在');
    await this.assessmentItemRepository.delete(itemId);
    return { id: itemId };
  }

  /**
   * 重新计算考核得分
   */
  async recalculateScore(assessmentId: number) {
    const items = await this.assessmentItemRepository.find({
      where: { assessmentId },
    });

    for (const item of items) {
      if (item.selfScore !== null || item.managerScore !== null) {
        const finalScore = calculateItemFinalScore(
          item.managerScore,
          item.selfScore,
          item.managerWeight,
          item.selfWeight,
        );
        item.finalScore = finalScore;
        item.level = scoreToLevel(finalScore);
        await this.assessmentItemRepository.save(item);
      }
    }

    // 计算考核总分
    const totalScore = calculateAssessmentScore(items.map(i => ({
      finalScore: i.finalScore || 0,
      weight: i.weight,
    })));

    return { totalScore, items };
  }

  /**
   * 获取指定月份的考核选取配置
   */
  async getSelections(month: string) {
    // 查找该月份的考核
    const assessments = await this.assessmentRepository.find({
      where: { month },
    });

    if (assessments.length === 0) {
      return { items: [], month };
    }

    // 获取所有相关考核的明细项
    const assessmentIds = assessments.map(a => a.id);
    const items = await this.assessmentItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect(LibraryItem, 'lib', 'lib.id = item.libraryItemId')
      .where('item.assessmentId IN (:...ids)', { ids: assessmentIds })
      .getRawMany();

    return {
      month,
      assessments,
      items: items.map(i => ({
        id: i.item_id,
        name: i.lib_name,
        category: i.lib_category,
        weight: i.item_weight,
        maxScore: i.lib_maxScore,
      })),
    };
  }

  /**
   * 保存指定月份的考核选取配置
   */
  async saveSelections(month: string, items: any[]) {
    // 查找或创建该月份的考核记录
    let assessment = await this.assessmentRepository.findOne({
      where: { month },
    });

    if (!assessment) {
      // 创建新的考核记录
      assessment = this.assessmentRepository.create({
        title: `${month}月度考核配置`,
        month,
        status: 'N1',
      });
      assessment = await this.assessmentRepository.save(assessment);
    }

    // 删除旧的配置
    await this.assessmentItemRepository.delete({ assessmentId: assessment.id });

    // 保存新的配置
    const newItems = items.map(item => ({
      assessmentId: assessment!.id,
      libraryItemId: item.id,
      weight: item.weight || 10,
      managerWeight: item.managerWeight || 70,
      selfWeight: item.selfWeight || 30,
    }));

    if (newItems.length > 0) {
      await this.assessmentItemRepository.save(
        this.assessmentItemRepository.create(newItems),
      );
    }

    return { success: true, month, items: newItems.length };
  }

  /**
   * 下发考核（批量为多个部门创建考核）
   */
  async launchAssessment(dto: LaunchAssessmentDto, createdBy: number) {
    const { year, month, deptIds, libraryItemIds, deadline } = dto;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    
    const results: any[] = [];
    
    for (const deptId of deptIds) {
      // 检查该月份该部门是否已有考核
      const existing = await this.assessmentRepository.findOne({
        where: { month: monthStr, deptId },
      });
      
      if (existing) {
        results.push({
          deptId,
          success: false,
          message: `部门${deptId}该月份已存在考核`,
        });
        continue;
      }

      // 获取部门的所有在职员工
      const users = await this.userRepository.find({
        where: { deptId, status: 1 },
      });

      if (users.length === 0) {
        results.push({
          deptId,
          success: false,
          message: `部门${deptId}没有在职员工`,
        });
        continue;
      }

      // 获取绩效库中启用的考核项（如果指定了ID则使用指定的，否则获取所有启用的）
      let libraryItems: LibraryItem[];
      if (libraryItemIds && libraryItemIds.length > 0) {
        libraryItems = await this.libraryRepository.find({
          where: { id: In(libraryItemIds), status: 1 },
        });
      } else {
        libraryItems = await this.libraryRepository.find({
          where: { status: 1 },
        });
      }

      if (libraryItems.length === 0) {
        results.push({
          deptId,
          success: false,
          message: '绩效库中没有可用的考核项',
        });
        continue;
      }

      // 创建考核主表
      const title = `${monthStr}月度绩效考评`;
      const assessment = this.assessmentRepository.create({
        title,
        month: monthStr,
        deptId,
        status: 'N2', // N2 表示已下发
        startDate: monthStr + '-01',
        endDate: deadline || '',
        createdBy,
      });
      const saved: Assessment = await this.assessmentRepository.save(assessment);

      // 为每个员工创建考核明细项
      const items: any[] = [];
      for (const user of users) {
        for (const libItem of libraryItems) {
          items.push({
            assessmentId: saved.id,
            userId: user.id,
            libraryItemId: libItem.id,
            weight: 10,
            managerWeight: 70,
            selfWeight: 30,
          });
        }
      }

      if (items.length > 0) {
        await this.assessmentItemRepository.save(
          this.assessmentItemRepository.create(items),
        );
      }

      results.push({
        deptId,
        success: true,
        assessmentId: saved.id,
        userCount: users.length,
        itemCount: items.length,
      });
    }

    return {
      success: results.every(r => r.success),
      month: monthStr,
      results,
    };
  }
}
