import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

/**
 * 用户角色枚举
 */
export enum UserRole {
  CHAIRMAN = 'chairman',   // 董事长
  FINANCE = 'finance',     // 财务部负责人
  HR = 'hr',               // HR专员
  MANAGER = 'manager',     // 部门经理
  EMPLOYEE = 'employee',   // 普通员工
}

/**
 * 用户实体
 * 存储系统用户信息，支持5种角色
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '登录用户名' })
  username: string;

  @Column({ type: 'varchar', length: 255, comment: '密码(bcrypt加密)' })
  password: string;

  @Column({ type: 'varchar', length: 50, comment: '真实姓名' })
  name: string;

  @Column({ type: 'varchar', length: 20, default: 'employee', comment: '角色: chairman/finance/hr/manager/employee' })
  role: string;

  @Column({ type: 'integer', nullable: true, comment: '所属部门ID' })
  deptId: number;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '手机号' })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '头像URL' })
  avatar: string;

  @Column({ type: 'integer', default: 1, comment: '状态: 1启用 0禁用' })
  status: number;

  @CreateDateColumn({ type: 'text', comment: '创建时间' })
  createdAt: string;

  @UpdateDateColumn({ type: 'text', comment: '更新时间' })
  updatedAt: string;
}
