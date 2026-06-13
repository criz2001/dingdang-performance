import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibraryItem } from '../../entities/library.entity';
import { CreateLibraryDto, UpdateLibraryDto, LibraryQueryDto } from './library.dto';

/**
 * 绩效库管理服务
 */
@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryItem)
    private readonly libraryRepository: Repository<LibraryItem>,
  ) {}

  /**
   * 查询绩效库列表
   */
  async findAll(query: LibraryQueryDto) {
    const { page = 1, pageSize = 20, type, keyword } = query;
    const qb = this.libraryRepository.createQueryBuilder('item');
    
    if (type) qb.andWhere('item.type = :type', { type });
    if (keyword) {
      qb.andWhere('item.name LIKE :keyword', { keyword: `%${keyword}%` });
    }
    qb.andWhere('item.status = 1');

    const skip = (page - 1) * pageSize;
    const [list, total] = await qb
      .skip(skip)
      .take(pageSize)
      .orderBy('item.id', 'ASC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 查询单个考核项
   */
  async findOne(id: number) {
    const item = await this.libraryRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('考核项不存在');
    return item;
  }

  /**
   * 创建考核项
   */
  async create(dto: CreateLibraryDto) {
    if (!['task', 'ability', 'temp'].includes(dto.type)) {
      throw new BadRequestException('分类类型无效，只能为 task/ability/temp');
    }
    const item = this.libraryRepository.create({
      name: dto.name,
      type: dto.type,
      description: dto.description || '',
      weightTemplate: dto.weightTemplate || null,
    });
    return this.libraryRepository.save(item);
  }

  /**
   * 更新考核项
   */
  async update(id: number, dto: UpdateLibraryDto) {
    const item = await this.libraryRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('考核项不存在');
    if (dto.type && !['task', 'ability', 'temp'].includes(dto.type)) {
      throw new BadRequestException('分类类型无效');
    }
    await this.libraryRepository.update(id, dto as any);
    return this.findOne(id);
  }

  /**
   * 删除考核项
   */
  async remove(id: number) {
    const item = await this.libraryRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('考核项不存在');
    await this.libraryRepository.update(id, { status: 0 });
    return { id };
  }

  /**
   * 按类型分组查询考核项
   */
  async findByType(type: string) {
    return this.libraryRepository.find({
      where: { type, status: 1 },
      order: { id: 'ASC' },
    });
  }

  /**
   * 获取所有分类
   */
  async getCategories() {
    const items = await this.libraryRepository.find({
      where: { status: 1 },
      select: ['type'],
    });
    const types = [...new Set(items.map(i => i.type))];
    const categoryMap: Record<string, { type: string; label: string }> = {
      task: { type: 'task', label: '任务绩效' },
      ability: { type: 'ability', label: '能力绩效' },
      temp: { type: 'temp', label: '临时考核' },
    };
    return types.filter(t => categoryMap[t]).map(t => categoryMap[t]);
  }
}
