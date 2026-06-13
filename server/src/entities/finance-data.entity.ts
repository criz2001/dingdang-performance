import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

/**
 * 财务数据实体
 * 存储每月的财务数据，可关联到绩效库项用于考核
 */
@Entity('finance_data')
export class FinanceData {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'integer', comment: '所属部门ID' })
  deptId: number;

  @Column({ type: 'varchar', length: 7, comment: '数据月份(YYYY-MM)' })
  month: string;

  @Column({ type: 'varchar', length: 100, comment: '指标名称' })
  metricName: string;

  @Column({ type: 'real', comment: '指标数值' })
  metricValue: number;

  @Column({ type: 'text', nullable: true, comment: '指标描述' })
  description: string;

  @Column({ type: 'integer', nullable: true, comment: '关联绩效库项ID(可选)' })
  libraryItemId: number;

  @CreateDateColumn({ type: 'text', comment: '创建时间' })
  createdAt: string;

  @UpdateDateColumn({ type: 'text', comment: '更新时间' })
  updatedAt: string;
}
