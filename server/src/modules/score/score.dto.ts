import { IsInt, IsIn, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 提交评分DTO
 */
export class SubmitScoreDto {
  @Type(() => Number)
  @IsInt({ message: '考核明细项ID必须为整数' })
  assessmentItemId: number;

  @IsIn(['manager', 'self'], { message: '评分类型无效' })
  scoreType: string;

  @Type(() => Number)
  @IsNumber({}, { message: '评分值必须为数字' })
  @Min(0, { message: '评分不能低于0' })
  @Max(100, { message: '评分不能高于100' })
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
