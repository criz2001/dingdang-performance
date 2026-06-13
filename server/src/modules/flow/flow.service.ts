import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from '../../entities/assessment.entity';
import { FlowLog } from '../../entities/flow-log.entity';
import {
  getFlowNode, getNextNode, canSubmit, canRollback,
} from './flow.config';

/**
 * 流程引擎服务
 * 负责考核流转：提交（submit）和回退（rollback）
 * 完整支持 N1-N9 九节点状态机
 */
@Injectable()
export class FlowService {
  constructor(
    @InjectRepository(Assessment)
    private readonly assessmentRepository: Repository<Assessment>,
    @InjectRepository(FlowLog)
    private readonly flowLogRepository: Repository<FlowLog>,
  ) {}

  /**
   * 提交到下一节点
   * @param assessmentId 考核ID
   * @param operatorId 操作人ID
   * @param operatorRole 操作人角色
   * @param remark 备注
   */
  async submit(
    assessmentId: number,
    operatorId: number,
    operatorRole: string,
    remark?: string,
  ): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findOne({ where: { id: assessmentId } });
    if (!assessment) {
      throw new BadRequestException('考核不存在');
    }

    const currentNode = getFlowNode(assessment.status);
    if (!currentNode) {
      throw new BadRequestException(`无效的流程节点: ${assessment.status}`);
    }

    // 权限校验：操作人角色必须与当前节点角色匹配
    if (currentNode.role !== operatorRole && operatorRole !== 'admin') {
      throw new ForbiddenException('当前节点不允许此角色操作');
    }

    if (!canSubmit(assessment.status)) {
      throw new BadRequestException(`节点 ${assessment.status} 不可提交`);
    }

    const nextNode = getNextNode(assessment.status);
    if (!nextNode) {
      throw new BadRequestException('没有下一节点');
    }

    // 记录流程日志
    const flowLog = this.flowLogRepository.create({
      assessmentId,
      fromNode: assessment.status,
      toNode: nextNode,
      action: 'submit',
      operatorId,
      remark: remark || '提交到下一节点',
    });
    await this.flowLogRepository.save(flowLog);

    // 更新考核状态
    assessment.status = nextNode;
    return this.assessmentRepository.save(assessment);
  }

  /**
   * 回退到指定节点
   * @param assessmentId 考核ID
   * @param targetNode 目标节点
   * @param operatorId 操作人ID
   * @param operatorRole 操作人角色
   * @param remark 备注
   */
  async rollback(
    assessmentId: number,
    targetNode: string,
    operatorId: number,
    operatorRole: string,
    remark?: string,
  ): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findOne({ where: { id: assessmentId } });
    if (!assessment) {
      throw new BadRequestException('考核不存在');
    }

    const currentNode = getFlowNode(assessment.status);
    if (!currentNode) {
      throw new BadRequestException(`无效的流程节点: ${assessment.status}`);
    }

    // 权限校验
    if (currentNode.role !== operatorRole && operatorRole !== 'admin') {
      throw new ForbiddenException('当前节点不允许此角色操作');
    }

    // 回退校验：只能回退到当前节点允许的 rollbackTo 列表中的节点
    if (!canRollback(assessment.status, targetNode)) {
      throw new BadRequestException(
        `节点 ${assessment.status} 不允许回退到 ${targetNode}，允许的回退目标: ${currentNode.rollbackTo.join(', ') || '无'}`,
      );
    }

    // 记录流程日志
    const flowLog = this.flowLogRepository.create({
      assessmentId,
      fromNode: assessment.status,
      toNode: targetNode,
      action: 'rollback',
      operatorId,
      remark: remark || `回退到节点 ${targetNode}`,
    });
    await this.flowLogRepository.save(flowLog);

    // 更新考核状态
    assessment.status = targetNode;
    return this.assessmentRepository.save(assessment);
  }

  /**
   * 获取指定考核的流程日志
   */
  async getFlowLogs(assessmentId: number) {
    return this.flowLogRepository.find({
      where: { assessmentId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 获取所有流程节点定义
   */
  async getFlowNodes() {
    const { FLOW_NODES, NODE_STATUS_MAP } = await import('./flow.config');
    return FLOW_NODES.map(n => ({
      ...n,
      status: NODE_STATUS_MAP[n.node] || '',
    }));
  }
}
