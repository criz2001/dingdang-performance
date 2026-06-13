import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../entities/dept.entity';

/**
 * 部门管理服务
 */
@Injectable()
export class DeptService {
  constructor(
    @InjectRepository(Department)
    private readonly deptRepository: Repository<Department>,
  ) {}

  /**
   * 查询所有部门（树形结构）
   */
  async findAll() {
    const depts = await this.deptRepository.find({
      where: { status: 1 },
      order: { sort: 'ASC', id: 'ASC' },
    });
    return this.buildTree(depts);
  }

  /**
   * 查询所有部门列表（扁平）
   */
  async findAllFlat() {
    return this.deptRepository.find({
      where: { status: 1 },
      order: { sort: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 查询单个部门
   */
  async findOne(id: number) {
    const dept = await this.deptRepository.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('部门不存在');
    return dept;
  }

  /**
   * 创建部门
   */
  async create(data: Partial<Department>) {
    const dept = this.deptRepository.create(data);
    return this.deptRepository.save(dept);
  }

  /**
   * 更新部门
   */
  async update(id: number, data: Partial<Department>) {
    const dept = await this.deptRepository.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('部门不存在');
    await this.deptRepository.update(id, data);
    return this.findOne(id);
  }

  /**
   * 删除部门
   */
  async remove(id: number) {
    const dept = await this.deptRepository.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('部门不存在');
    await this.deptRepository.update(id, { status: 0 });
    return { id };
  }

  /**
   * 构建树形结构
   */
  private buildTree(depts: Department[]): any[] {
    const map = new Map<number, any>();
    const roots: any[] = [];

    depts.forEach(d => {
      map.set(d.id, { ...d, children: [] });
    });

    depts.forEach(d => {
      const node = map.get(d.id);
      if (d.parentId && map.has(d.parentId)) {
        map.get(d.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
