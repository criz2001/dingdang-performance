import { IsString, IsOptional, IsInt, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建部门DTO
 */
export class CreateDeptDto {
  @IsString({ message: '部门名称必须为字符串' })
  @MinLength(1, { message: '部门名称不能为空' })
  @MaxLength(100, { message: '部门名称最多100个字符' })
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '上级部门ID必须为整数' })
  parentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '排序号必须为整数' })
  sort?: number;
}

/**
 * 更新部门DTO
 */
export class UpdateDeptDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
