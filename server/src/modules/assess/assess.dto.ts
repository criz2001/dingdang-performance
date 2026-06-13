import {
  IsString, IsOptional, IsInt, IsIn, Min, Max, MinLength, MaxLength,
  IsArray, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 考核项配置
 */
export class ItemConfig {
  @IsArray()
  @IsInt({ each: true })
  libraryItemIds: number[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  weight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  managerWeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  selfWeight?: number;
}

/**
 * 创建考核DTO
 */
export class CreateAssessmentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsString({ message: '考核月份必须为字符串' })
  month: string;

  @Type(() => Number)
  @IsInt({ message: '部门ID必须为整数' })
  deptId: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemConfig)
  itemConfigs?: ItemConfig[];
}

/**
 * 更新考核DTO
 */
export class UpdateAssessmentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

/**
 * 考核查询DTO
 */
export class AssessmentQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @Type(() => Number)
  deptId?: number;

  @IsOptional()
  @IsIn(['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9'])
  status?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}

/**
 * 添加考核明细项DTO
 */
export class AddAssessmentItemDto {
  @Type(() => Number)
  @IsInt({ message: '用户ID必须为整数' })
  userId: number;

  @Type(() => Number)
  @IsInt({ message: '考核项ID必须为整数' })
  libraryItemId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  weight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  managerWeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  selfWeight?: number;
}

/**
 * 下发考核DTO
 */
export class LaunchAssessmentDto {
  @Type(() => Number)
  @IsInt({ message: '年份必须为整数' })
  year: number;

  @Type(() => Number)
  @IsInt({ message: '月份必须为整数' })
  @Min(1)
  @Max(12)
  month: number;

  @IsArray()
  @IsInt({ each: true })
  deptIds: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  libraryItemIds?: number[];

  @IsOptional()
  @IsString()
  deadline?: string;
}
