import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

/**
 * 流程日志实体
 * 记录考核流程的每一步操作（提交/回退），用于追溯和审计
 */
@Entity('flow_logs')
export class FlowLog {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'integer', comment: '关联考核ID' })
  assessmentId: number;

  @Column({ type: 'varchar', length: 10, comment: '来源节点' })
  fromNode: string;

  @Column({ type: 'varchar', length: 10, comment: '目标节点' })
  toNode: string;

  @Column({ type: 'varchar', length: 20, default: 'submit', comment: '操作类型: submit(提交)/rollback(回退)' })
  action: string;

  @Column({ type: 'integer', comment: '操作人用户ID' })
  operatorId: number;

  @Column({ type: 'text', nullable: true, comment: '操作备注' })
  remark: string;

  @CreateDateColumn({ type: 'text', comment: '创建时间' })
  createdAt: string;
}
