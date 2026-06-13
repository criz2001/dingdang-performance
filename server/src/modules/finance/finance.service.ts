import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanceData } from '../../entities/finance-data.entity';

/**
 * 财务数据管理服务
 */
@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceData)
    private readonly financeRepository: Repository<FinanceData>,
  ) {}

  /**
   * 查询财务数据列表
   */
  async findAll(query: { page?: number; pageSize?: number; deptId?: number; month?: string }) {
    const { page = 1, pageSize = 20, deptId, month } = query;
    const qb = this.financeRepository.createQueryBuilder('f');

    if (deptId) qb.andWhere('f.deptId = :deptId', { deptId });
    if (month) qb.andWhere('f.month = :month', { month });

    const skip = (page - 1) * pageSize;
    const [list, total] = await qb
      .skip(skip)
      .take(pageSize)
      .orderBy('f.month', 'DESC')
      .addOrderBy('f.deptId', 'ASC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 查询单个财务数据
   */
  async findOne(id: number) {
    const data = await this.financeRepository.findOne({ where: { id } });
    if (!data) throw new NotFoundException('财务数据不存在');
    return data;
  }

  /**
   * 批量导入财务数据
   */
  async batchImport(items: Array<{
    deptId: number;
    month: string;
    metricName: string;
    metricValue: number;
    description?: string;
    libraryItemId?: number;
  }>) {
    if (!items || items.length === 0) {
      throw new BadRequestException('导入数据不能为空');
    }

    const entities = items.map(item =>
      this.financeRepository.create(item),
    );
    return this.financeRepository.save(entities);
  }

  /**
   * 单条创建财务数据
   */
  async create(data: Partial<FinanceData>) {
    const entity = this.financeRepository.create(data);
    return this.financeRepository.save(entity);
  }

  /**
   * 更新财务数据
   */
  async update(id: number, data: Partial<FinanceData>) {
    const existing = await this.financeRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('财务数据不存在');
    await this.financeRepository.update(id, data);
    return this.findOne(id);
  }

  /**
   * 删除财务数据
   */
  async remove(id: number) {
    const data = await this.financeRepository.findOne({ where: { id } });
    if (!data) throw new NotFoundException('财务数据不存在');
    await this.financeRepository.delete(id);
    return { id };
  }

  /**
   * 关联考核项：将财务指标关联到绩效库项
   */
  async linkLibraryItem(id: number, libraryItemId: number) {
    const data = await this.financeRepository.findOne({ where: { id } });
    if (!data) throw new NotFoundException('财务数据不存在');
    data.libraryItemId = libraryItemId;
    return this.financeRepository.save(data);
  }

  /**
   * 查询某部门某月的财务指标
   */
  async findByDeptAndMonth(deptId: number, month: string) {
    return this.financeRepository.find({
      where: { deptId, month },
      order: { id: 'ASC' },
    });
  }
}
