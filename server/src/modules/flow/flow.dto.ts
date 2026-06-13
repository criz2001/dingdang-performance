import { IsInt, IsOptional, IsString, IsIn } from 'class-validator';

/**
 * 流程操作DTO
 */
export class FlowActionDto {
  @IsInt({ message: '考核ID必须为整数' })
  assessmentId: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 回退操作DTO
 */
export class FlowRollbackDto extends FlowActionDto {
  @IsString({ message: '目标节点必须为字符串' })
  @IsIn(['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9'], { message: '无效的节点编码' })
  targetNode: string;
}
