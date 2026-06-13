import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 角色装饰器 - 声明接口所需角色
 * 用法: @Roles('chairman', 'finance')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
