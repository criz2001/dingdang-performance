import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

/**
 * 绩效库(考核项模板)实体
 * 分类管理：task(任务绩效) / ability(能力绩效) / temp(临时考核)
 */
@Entity('library_items')
export class LibraryItem {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '考核项名称' })
  name: string;

  @Column({ type: 'varchar', length: 20, default: 'task', comment: '分类: task(任务)/ability(能力)/temp(临时)' })
  type: string;

  @Column({ type: 'text', nullable: true, comment: '考核项描述' })
  description: string | null;

  @Column({ type: 'text', nullable: true, comment: '权重模板(JSON字符串)' })
  weightTemplate: string | null;

  @Column({ type: 'integer', default: 1, comment: '状态: 1启用 0禁用' })
  status: number;

  @CreateDateColumn({ type: 'text', comment: '创建时间' })
  createdAt: string;

  @UpdateDateColumn({ type: 'text', comment: '更新时间' })
  updatedAt: string;
}
