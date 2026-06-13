import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';

/**
 * 认证服务
 * 提供用户登录、Token签发功能
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户登录验证
   * @param username 用户名
   * @param password 密码
   * @returns 用户信息和Token
   */
  async login(username: string, password: string): Promise<{ user: Partial<User>; token: string }> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    // 返回脱敏后的用户信息
    const { password: _, ...userInfo } = user;
    return { user: userInfo, token };
  }

  /**
   * 获取当前登录用户信息
   */
  async getProfile(userId: number): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const { password: _, ...userInfo } = user;
    return userInfo;
  }

  /**
   * 验证Token的有效性（由JwtStrategy调用）
   */
  async validateUser(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.status !== 1) return null;
    return user;
  }
}
