import { IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建考核项DTO
 */
export class CreateLibraryDto {
  @IsString({ message: '名称必须为字符串' })
  @MinLength(1, { message: '名称不能为空' })
  @MaxLength(200, { message: '名称最多200个字符' })
  name: string;

  @IsIn(['task', 'ability', 'temp'], { message: '分类无效: task/ability/temp' })
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  weightTemplate?: string;
}

/**
 * 更新考核项DTO
 */
export class UpdateLibraryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsIn(['task', 'ability', 'temp'])
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  weightTemplate?: string;
}

/**
 * 考核项查询DTO
 */
export class LibraryQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsIn(['task', 'ability', 'temp'])
  type?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}
