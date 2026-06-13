import {
  IsString, IsOptional, IsInt, IsNumber, IsArray, Min, Max, MinLength, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 财务数据导入项
 */
export class FinanceImportItem {
  @Type(() => Number)
  @IsInt({ message: '部门ID必须为整数' })
  deptId: number;

  @IsString({ message: '月份必须为字符串' })
  month: string;

  @IsString({ message: '指标名称必须为字符串' })
  @MinLength(1)
  @MaxLength(100)
  metricName: string;

  @Type(() => Number)
  @IsNumber({}, { message: '指标值必须为数字' })
  metricValue: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  libraryItemId?: number;
}

/**
 * 创建财务数据DTO
 */
export class CreateFinanceDto {
  @Type(() => Number)
  @IsInt({ message: '部门ID必须为整数' })
  deptId: number;

  @IsString({ message: '月份必须为字符串' })
  month: string;

  @IsString({ message: '指标名称必须为字符串' })
  @MinLength(1)
  @MaxLength(100)
  metricName: string;

  @Type(() => Number)
  @IsNumber({}, { message: '指标值必须为数字' })
  @Min(0)
  metricValue: number;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * 批量导入财务数据DTO
 */
export class BatchImportFinanceDto {
  @IsArray({ message: '数据必须为数组' })
  @ValidateNested({ each: true })
  @Type(() => FinanceImportItem)
  items: FinanceImportItem[];
}

/**
 * 财务数据查询DTO
 */
export class FinanceQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deptId?: number;

  @IsOptional()
  @IsString()
  month?: string;
}

/**
 * 关联绩效库项DTO
 */
export class LinkLibraryDto {
  @Type(() => Number)
  @IsInt({ message: '绩效库项ID必须为整数' })
  libraryItemId: number;
}
