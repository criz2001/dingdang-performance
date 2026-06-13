import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 报告查询DTO
 */
export class ReportQueryDto {
  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  startMonth?: string;

  @IsOptional()
  @IsString()
  endMonth?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
