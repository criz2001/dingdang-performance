/**
 * 流程节点配置
 * N1-N9 完整状态机定义
 * 
 * 节点说明：
 * N1 - 待自评（员工填写自评）
 * N2 - 待主管评分（经理打分）
 * N3 - 待HR复核（HR审核确认）
 * N4 - 待财务确认（财务数据确认）
 * N5 - 待董事长审批（董事长最终审批）
 * N6 - 待发布（准备发布结果）
 * N7 - 已发布（结果已公示）
 * N8 - 已归档（归档保存）
 * N9 - 已关闭（流程终止）
 */

export interface FlowNodeConfig {
  node: string;           // 节点编码 N1-N9
  name: string;           // 节点中文名
  role: string;           // 可操作角色
  next: string[];         // 可流转到的节点
  rollbackTo: string[];   // 可回退到的节点列表
}

/**
 * N1-N9 流程节点定义
 */
export const FLOW_NODES: FlowNodeConfig[] = [
  {
    node: 'N1',
    name: '待自评',
    role: 'employee',
    next: ['N2'],
    rollbackTo: [],
  },
  {
    node: 'N2',
    name: '待主管评分',
    role: 'manager',
    next: ['N3'],
    rollbackTo: ['N1'],
  },
  {
    node: 'N3',
    name: '待HR复核',
    role: 'hr',
    next: ['N4'],
    rollbackTo: ['N1', 'N2'],
  },
  {
    node: 'N4',
    name: '待财务确认',
    role: 'finance',
    next: ['N5'],
    rollbackTo: ['N2', 'N3'],
  },
  {
    node: 'N5',
    name: '待董事长审批',
    role: 'chairman',
    next: ['N6'],
    rollbackTo: ['N3', 'N4'],
  },
  {
    node: 'N6',
    name: '待发布',
    role: 'hr',
    next: ['N7'],
    rollbackTo: ['N4'],
  },
  {
    node: 'N7',
    name: '已发布',
    role: 'hr',
    next: ['N8'],
    rollbackTo: ['N6'],
  },
  {
    node: 'N8',
    name: '已归档',
    role: 'hr',
    next: ['N9'],
    rollbackTo: ['N7'],
  },
  {
    node: 'N9',
    name: '已关闭',
    role: 'hr',
    next: [],
    rollbackTo: ['N8'],
  },
];

/**
 * 节点到状态的映射
 */
export const NODE_STATUS_MAP: Record<string, string> = {
  N1: 'self_pending',       // 待自评
  N2: 'manager_pending',    // 待主管评分
  N3: 'hr_pending',         // 待HR复核
  N4: 'finance_pending',    // 待财务确认
  N5: 'chairman_pending',   // 待董事长审批
  N6: 'publish_pending',    // 待发布
  N7: 'published',          // 已发布
  N8: 'archived',           // 已归档
  N9: 'closed',             // 已关闭
};

/**
 * 获取节点配置
 */
export function getFlowNode(node: string): FlowNodeConfig | undefined {
  return FLOW_NODES.find(n => n.node === node);
}

/**
 * 验证是否可以提交到下一节点
 */
export function canSubmit(currentNode: string): boolean {
  const node = getFlowNode(currentNode);
  return !!node && node.next.length > 0;
}

/**
 * 验证是否可以回退到目标节点
 */
export function canRollback(currentNode: string, targetNode: string): boolean {
  const node = getFlowNode(currentNode);
  return !!node && node.rollbackTo.includes(targetNode);
}

/**
 * 获取下一个节点的编码
 */
export function getNextNode(currentNode: string): string | null {
  const node = getFlowNode(currentNode);
  return node && node.next.length > 0 ? node.next[0] : null;
}
