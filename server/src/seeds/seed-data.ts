/**
 * 种子数据
 * 创建体验版演示用的默认数据
 */
import * as bcrypt from 'bcryptjs';

export interface SeedUser {
  username: string;
  password: string;
  name: string;
  role: string;
  deptId: number;
  status: number;
}

export interface SeedDept {
  name: string;
  parentId: number | null;
  sort: number;
  status: number;
}

export interface SeedLibraryItem {
  name: string;
  type: string;
  description: string;
  status: number;
}

/**
 * 加密密码（同步）
 */
function hashPassword(plain: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plain, salt);
}

const defaultPwd = process.env.DEFAULT_PASSWORD || '123456';
const hashedPwd = hashPassword(defaultPwd);

/**
 * 部门种子数据
 */
export const seedDepts: SeedDept[] = [
  { name: '研发部', parentId: null, sort: 1, status: 1 },
  { name: '财务部', parentId: null, sort: 2, status: 1 },
  { name: '人事行政部', parentId: null, sort: 3, status: 1 },
];

/**
 * 用户种子数据
 * 5个角色各一个用户：董事长、财务部负责人、HR专员、研发部经理、普通员工
 * 研发部(id:1) - 研发部经理、普通员工
 * 财务部(id:2) - 财务部负责人
 * 人事行政部(id:3) - HR专员、董事长(公司级)
 */
export const seedUsers: SeedUser[] = [
  {
    username: 'chairman',
    password: hashedPwd,
    name: '张总',
    role: 'chairman',
    deptId: 3,   // 董事长归属人事行政部
    status: 1,
  },
  {
    username: 'finance_li',
    password: hashedPwd,
    name: '李财务',
    role: 'finance',
    deptId: 2,   // 财务部
    status: 1,
  },
  {
    username: 'hr_wang',
    password: hashedPwd,
    name: '王HR',
    role: 'hr',
    deptId: 3,   // 人事行政部
    status: 1,
  },
  {
    username: 'rd_zhao',
    password: hashedPwd,
    name: '赵经理',
    role: 'manager',
    deptId: 1,   // 研发部
    status: 1,
  },
  {
    username: 'emp_chen',
    password: hashedPwd,
    name: '陈工',
    role: 'employee',
    deptId: 1,   // 研发部
    status: 1,
  },
];

/**
 * 绩效库种子数据
 */
export const seedLibraryItems: SeedLibraryItem[] = [
  // 任务绩效
  { name: '任务完成质量', type: 'task', description: '考核任务完成的质量标准', status: 1 },
  { name: '任务完成及时性', type: 'task', description: '考核任务是否按时完成', status: 1 },
  { name: '工作主动性', type: 'task', description: '考核工作的主动性和积极性', status: 1 },

  // 能力绩效
  { name: '专业技能', type: 'ability', description: '岗位所需的专业技术能力', status: 1 },
  { name: '沟通协作', type: 'ability', description: '团队沟通与协作能力', status: 1 },
  { name: '问题解决能力', type: 'ability', description: '分析和解决问题的能力', status: 1 },
  { name: '学习创新能力', type: 'ability', description: '学习新知识和创新的能力', status: 1 },

  // 临时考核
  { name: '项目贡献', type: 'temp', description: '特殊项目的贡献度评估', status: 1 },
  { name: '考勤情况', type: 'temp', description: '当月出勤情况考核', status: 1 },
];

/**
 * 考核种子数据配置
 * 为2024年6月的研发部创建一个完整的考核示例
 */
export const seedAssessmentConfig = {
  title: '2024年6月研发部绩效考评',
  month: '2024-06',
  deptId: 1,  // 研发部
  status: 'N1' as const,
  createdBy: 4,  // 赵经理
};
