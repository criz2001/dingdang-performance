import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

/**
 * 考核明细项实体
 * 每个考核包含多个明细项，关联被考核人、考核库项、权重和各项评分
 */
@Entity('assessment_items')
export class AssessmentItem {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'integer', comment: '所属考核ID' })
  assessmentId: number;

  @Column({ type: 'integer', comment: '被考核人用户ID' })
  userId: number;

  @Column({ type: 'integer', comment: '关联绩效库项ID' })
  libraryItemId: number;

  @Column({ type: 'real', default: 10, comment: '权重(百分比, 如 10 表示10%)' })
  weight: number;

  @Column({ type: 'real', nullable: true, comment: '自评分(0-100)' })
  selfScore: number;

  @Column({ type: 'real', nullable: true, comment: '经理评分(0-100)' })
  managerScore: number;

  @Column({ type: 'real', nullable: true, comment: '最终得分=manager*mgWeight+self*selfWeight/100' })
  finalScore: number;

  @Column({ type: 'varchar', length: 2, nullable: true, comment: '等级: S/A/B/C/D' })
  level: string;

  @Column({ type: 'real', default: 70, comment: '经理评分权重(默认70%, 范围0-100)' })
  managerWeight: number;

  @Column({ type: 'real', default: 30, comment: '自评权重(默认30%, 范围0-100)' })
  selfWeight: number;

  @Column({ type: 'text', nullable: true, comment: '自评评语' })
  selfComment: string;

  @Column({ type: 'text', nullable: true, comment: '经理评语' })
  managerComment: string;

  @Column({ type: 'text', nullable: true, comment: 'HR评语' })
  hrComment: string;

  @CreateDateColumn({ type: 'text', comment: '创建时间' })
  createdAt: string;

  @UpdateDateColumn({ type: 'text', comment: '更新时间' })
  updatedAt: string;
}
