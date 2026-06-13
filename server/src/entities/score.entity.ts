import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

/**
 * 评分记录实体
 * 记录每次评分的明细，支持按评分类型追溯
 */
@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'integer', comment: '关联考核明细项ID' })
  assessmentItemId: number;

  @Column({ type: 'varchar', length: 10, comment: '评分类型: manager(经理)/self(自评)' })
  scoreType: string;

  @Column({ type: 'real', comment: '评分值(0-100)' })
  score: number;

  @Column({ type: 'text', nullable: true, comment: '评语' })
  comment: string | undefined;

  @Column({ type: 'integer', comment: '评分人用户ID' })
  createdBy: number;

  @CreateDateColumn({ type: 'text', comment: '创建时间' })
  createdAt: string;

  @UpdateDateColumn({ type: 'text', comment: '更新时间' })
  updatedAt: string;
}
