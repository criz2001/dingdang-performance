import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './user.dto';

/**
 * 用户管理服务
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 查询用户列表（支持分页和筛选）
   */
  async findAll(query: UserQueryDto) {
    const { page = 1, pageSize = 20, role, keyword, deptId, status } = query;
    const qb = this.userRepository.createQueryBuilder('user');
    
    if (role) qb.andWhere('user.role = :role', { role });
    if (deptId) qb.andWhere('user.deptId = :deptId', { deptId });
    if (status !== undefined) qb.andWhere('user.status = :status', { status });
    if (keyword) {
      qb.andWhere('(user.name LIKE :keyword OR user.username LIKE :keyword)', 
        { keyword: `%${keyword}%` });
    }

    const skip = (page - 1) * pageSize;
    const [list, total] = await qb
      .skip(skip)
      .take(pageSize)
      .orderBy('user.id', 'ASC')
      .getManyAndCount();

    // 脱敏处理
    const safeList = list.map(({ password, ...rest }) => rest);
    return { list: safeList, total, page, pageSize };
  }

  /**
   * 查询单个用户详情
   */
  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    const { password, ...userInfo } = user;
    return userInfo;
  }

  /**
   * 创建用户
   */
  async create(dto: CreateUserDto) {
    // 检查用户名唯一性
    const exists = await this.userRepository.findOne({ where: { username: dto.username } });
    if (exists) throw new BadRequestException('用户名已存在');

    if (!Object.values(UserRole).includes(dto.role as UserRole)) {
      throw new BadRequestException('无效的角色类型');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  /**
   * 更新用户信息
   */
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');

    if (dto.role && !Object.values(UserRole).includes(dto.role as UserRole)) {
      throw new BadRequestException('无效的角色类型');
    }

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      dto.password = await bcrypt.hash(dto.password, salt);
    }

    await this.userRepository.update(id, dto as any);
    return this.findOne(id);
  }

  /**
   * 删除用户（软删除 - 置为禁用）
   */
  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    await this.userRepository.update(id, { status: 0 });
    return { id };
  }

  /**
   * 根据角色查询用户
   */
  async findByRole(role: string): Promise<User[]> {
    return this.userRepository.find({ where: { role, status: 1 } });
  }

  /**
   * 根据部门查询用户
   */
  async findByDept(deptId: number): Promise<User[]> {
    return this.userRepository.find({ where: { deptId, status: 1 } });
  }

  /**
   * 重置用户密码为默认密码
   */
  async resetPassword(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');

    const defaultPassword = '123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    await this.userRepository.update(id, { password: hashedPassword });

    return { password: defaultPassword };
  }
}
