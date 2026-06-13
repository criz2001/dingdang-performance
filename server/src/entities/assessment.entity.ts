import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

/**
 * 月度考核实体
 * 每个月度创建一份考核，关联到部门，包含完整的流程状态
 */
@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '考核标题' })
  title: string;

  @Column({ type: 'varchar', length: 7, comment: '考核月份(YYYY-MM)' })
  month: string;

  @Column({ type: 'integer', comment: '考核部门ID' })
  deptId: number;

  @Column({ type: 'varchar', length: 10, default: 'N1', comment: '流程节点: N1-N9' })
  status: string;

  @Column({ type: 'text', nullable: true, comment: '考核开始日期' })
  startDate: string;

  @Column({ type: 'text', nullable: true, comment: '考核结束日期' })
  endDate: string;

  @Column({ type: 'integer', comment: '创建人用户ID' })
  createdBy: number;

  @CreateDateColumn({ type: 'text', comment: '创建时间' })
  createdAt: string;

  @UpdateDateColumn({ type: 'text', comment: '更新时间' })
  updatedAt: string;
}
