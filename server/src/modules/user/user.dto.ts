import { IsString, IsOptional, IsIn, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../entities/user.entity';

/**
 * 创建用户DTO
 */
export class CreateUserDto {
  @IsString({ message: '用户名必须为字符串' })
  @MinLength(2, { message: '用户名至少2个字符' })
  @MaxLength(50, { message: '用户名最多50个字符' })
  username: string;

  @IsString({ message: '密码必须为字符串' })
  @MinLength(4, { message: '密码至少4个字符' })
  password: string;

  @IsString({ message: '姓名必须为字符串' })
  @MinLength(1, { message: '姓名不能为空' })
  @MaxLength(50, { message: '姓名最多50个字符' })
  name: string;

  @IsOptional()
  @IsIn(Object.values(UserRole), { message: '无效的角色类型' })
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '部门ID必须为整数' })
  deptId?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}

/**
 * 更新用户DTO
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deptId?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}

/**
 * 用户列表查询DTO
 */
export class UserQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deptId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;
}
