import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

/**
 * 部门实体
 */
@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '部门名称' })
  name: string;

  @Column({ type: 'integer', nullable: true, comment: '上级部门ID' })
  parentId: number;

  @Column({ type: 'integer', default: 0, comment: '排序序号' })
  sort: number;

  @Column({ type: 'integer', default: 1, comment: '状态: 1启用 0禁用' })
  status: number;

  @CreateDateColumn({ type: 'text', comment: '创建时间' })
  createdAt: string;

  @UpdateDateColumn({ type: 'text', comment: '更新时间' })
  updatedAt: string;
}
