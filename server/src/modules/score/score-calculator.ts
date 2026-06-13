/**
 * 评分计算工具函数
 * 
 * 计算逻辑：
 * 1. calculateItemFinalScore: manager_score * managerWeight/100 + self_score * selfWeight/100
 * 2. calculateAssessmentScore: 各项 final_score * weight/100 求和
 * 3. scoreToLevel: S(≥90) A(≥80) B(≥70) C(≥60) D(<60)
 */

/**
 * 计算考核项最终得分
 * @param managerScore 经理评分(0-100)
 * @param selfScore 自评分(0-100)
 * @param managerWeight 经理评分权重(0-100)
 * @param selfWeight 自评权重(0-100)
 * @returns 最终得分
 */
export function calculateItemFinalScore(
  managerScore: number | null,
  selfScore: number | null,
  managerWeight: number,
  selfWeight: number,
): number {
  const mgr = managerScore ?? 0;
  const slf = selfScore ?? 0;
  // 计算方法: manager_score * managerWeight/100 + self_score * selfWeight/100
  return Math.round((mgr * managerWeight + slf * selfWeight) / 100 * 100) / 100;
}

/**
 * 计算考核总分
 * @param items 考核项列表（含 finalScore 和 weight）
 * @returns 加权总分
 */
export function calculateAssessmentScore(
  items: Array<{ finalScore: number; weight: number }>,
): number {
  if (items.length === 0) return 0;
  
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = items.reduce((sum, item) => {
    return sum + item.finalScore * item.weight;
  }, 0);

  return Math.round(weightedSum / totalWeight * 100) / 100;
}

/**
 * 分数转等级
 * @param score 最终得分
 * @returns 等级 S/A/B/C/D
 */
export function scoreToLevel(score: number): string {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}
