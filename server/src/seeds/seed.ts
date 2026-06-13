/**
 * 种子数据执行脚本
 * 运行方式: npx ts-node src/seeds/seed.ts
 * 或: npm run seed
 */
import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env
config({ path: resolve(__dirname, '../../.env') });

import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { User } from '../entities/user.entity';
import { Department } from '../entities/dept.entity';
import { LibraryItem } from '../entities/library.entity';
import { Assessment } from '../entities/assessment.entity';
import { AssessmentItem } from '../entities/assessment-item.entity';
import { FlowLog } from '../entities/flow-log.entity';
import { FinanceData } from '../entities/finance-data.entity';
import {
  seedDepts,
  seedUsers,
  seedLibraryItems,
  seedAssessmentConfig,
} from './seed-data';

async function main() {
  console.log('🚀 开始初始化种子数据...\n');

  // 创建数据库连接
  const dbType = process.env.DB_TYPE || 'better-sqlite3';
  const options: DataSourceOptions = {
    type: dbType as any,
    entities: [
      User, Department, LibraryItem, Assessment, AssessmentItem, FlowLog, FinanceData,
    ],
    synchronize: true,
    logging: false,
  };

  if (dbType === 'mysql') {
    Object.assign(options, {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      username: process.env.MYSQL_USERNAME || 'root',
      password: process.env.MYSQL_PASSWORD || '123456',
      database: process.env.MYSQL_DATABASE || 'dingdang_performance',
    });
  } else {
    Object.assign(options, {
      database: resolve(__dirname, '../../', process.env.SQLITE_PATH || './data/dingdang.db'),
    });
  }

  const dataSource = new DataSource(options);
  await dataSource.initialize();
  console.log('✅ 数据库连接成功');

  const userRepo = dataSource.getRepository(User);
  const deptRepo = dataSource.getRepository(Department);
  const libRepo = dataSource.getRepository(LibraryItem);
  const assessRepo = dataSource.getRepository(Assessment);
  const assessItemRepo = dataSource.getRepository(AssessmentItem);
  const flowLogRepo = dataSource.getRepository(FlowLog);
  const financeRepo = dataSource.getRepository(FinanceData);

  // 清理旧数据（按依赖顺序逆序删除）
  console.log('🔄 清理旧数据...');
  await flowLogRepo.clear();
  await assessItemRepo.clear();
  await assessRepo.clear();
  await financeRepo.clear();
  await libRepo.clear();
  await userRepo.clear();
  await deptRepo.clear();
  console.log('✅ 旧数据清理完成');

  // 1. 创建部门
  console.log('\n📁 创建部门...');
  const depts = deptRepo.create(seedDepts as any[]);
  const savedDepts = await deptRepo.save(depts);
  savedDepts.forEach(d => console.log(`   - ${d.name} (id: ${d.id})`));

  // 更新用户种子数据中的 deptId 为实际ID
  const deptMap = new Map(savedDepts.map(d => [d.name, d.id]));
  const updatedUsers = seedUsers.map(u => ({
    ...u,
    deptId: deptMap.get(
      savedDepts.find(d => d.id === u.deptId)?.name || ''
    ) || 1,
  }));

  // 2. 创建用户
  console.log('\n👤 创建用户...');
  const users = userRepo.create(updatedUsers as any[]);
  const savedUsers = await userRepo.save(users);
  savedUsers.forEach(u => console.log(`   - ${u.name} (${u.role}) [${u.username}]`));

  // 3. 创建绩效库项
  console.log('\n📚 创建绩效库项...');
  const libItems = libRepo.create(seedLibraryItems as any[]);
  const savedLibItems = await libRepo.save(libItems);
  savedLibItems.forEach(item => {
    const typeMap: Record<string, string> = { task: '任务', ability: '能力', temp: '临时' };
    console.log(`   - [${typeMap[item.type] || item.type}] ${item.name} (id: ${item.id})`);
  });

  // 4. 创建示例考核
  console.log('\n📋 创建示例考核...');
  const assessment = assessRepo.create({
    title: seedAssessmentConfig.title,
    month: seedAssessmentConfig.month,
    deptId: seedAssessmentConfig.deptId,
    status: seedAssessmentConfig.status,
    createdBy: seedAssessmentConfig.createdBy,
  });
  const savedAssessment = await assessRepo.save(assessment);
  console.log(`   - ${savedAssessment.title} (${savedAssessment.month}, id: ${savedAssessment.id})`);

  // 5. 创建考核明细（研发部的员工与考核项交叉关联）
  console.log('\n📝 创建考核明细项...');
  const rdUsers = savedUsers.filter(u => u.deptId === 1); // 研发部员工
  const selectedLibIds = savedLibItems.slice(0, 6).map(i => i.id); // 选前6个考核项

  const weightConfigs = [
    { libIdx: 0, weight: 20, mgrW: 70, selfW: 30 },   // 任务完成质量
    { libIdx: 1, weight: 15, mgrW: 70, selfW: 30 },   // 任务完成及时性
    { libIdx: 2, weight: 10, mgrW: 70, selfW: 30 },   // 工作主动性
    { libIdx: 3, weight: 25, mgrW: 70, selfW: 30 },   // 专业技能
    { libIdx: 4, weight: 15, mgrW: 70, selfW: 30 },   // 沟通协作
    { libIdx: 5, weight: 15, mgrW: 70, selfW: 30 },   // 问题解决能力
  ];

  const assessItems: any[] = [];
  for (const user of rdUsers) {
    for (const cfg of weightConfigs) {
      const libItem = savedLibItems[cfg.libIdx];
      if (!libItem) continue;
      assessItems.push({
        assessmentId: savedAssessment.id,
        userId: user.id,
        libraryItemId: libItem.id,
        weight: cfg.weight,
        managerWeight: cfg.mgrW,
        selfWeight: cfg.selfW,
      });
    }
  }

  const savedItems = await assessItemRepo.save(assessItemRepo.create(assessItems));
  console.log(`   - 共创建 ${savedItems.length} 条考核明细项`);
  console.log(`   - 涉及 ${rdUsers.length} 位员工 × ${weightConfigs.length} 项考核指标`);

  // 6. 创建示范评分数据
  console.log('\n⭐ 创建示范评分...');
  // 为自评（赵经理和陈工填写自评）
  const selfScores = [
    { userId: 4, score: 88, comment: '本季度任务完成情况良好' },
    { userId: 5, score: 82, comment: '基本完成任务，部分项目需加强' },
  ];

  for (const ss of selfScores) {
    const userItems = savedItems.filter(i => i.userId === ss.userId);
    for (const item of userItems) {
      await assessItemRepo.update(item.id, {
        selfScore: ss.score,
        selfComment: ss.comment,
      });
    }
    console.log(`   - ${ss.comment} [${ss.score}分] (userId: ${ss.userId})`);
  }

  // 经理评分（赵经理为陈工打分）
  const mgrScores: Array<{ userId: number; items: Array<{ score: number; comment: string }> }> = [
    {
      userId: 5, // 陈工
      items: [
        { score: 85, comment: '代码质量良好' },
        { score: 80, comment: '偶尔有延迟，整体可控' },
        { score: 90, comment: '主动性强，经常提出优化建议' },
        { score: 82, comment: '技术能力扎实' },
        { score: 78, comment: '沟通有待提升' },
        { score: 85, comment: '问题分析能力不错' },
      ],
    },
  ];

  for (const mgr of mgrScores) {
    const userItems = savedItems.filter(i => i.userId === mgr.userId);
    for (let idx = 0; idx < userItems.length && idx < mgr.items.length; idx++) {
      const item = userItems[idx];
      const scoreData = mgr.items[idx];
      await assessItemRepo.update(item.id, {
        managerScore: scoreData.score,
        managerComment: scoreData.comment,
      });
    }
    console.log(`   - 经理评分 (userId: ${mgr.userId})`);
  }

  // 计算最终得分
  console.log('\n🧮 计算最终得分...');
  const allItems = await assessItemRepo.find({ where: { assessmentId: savedAssessment.id } });
  for (const item of allItems) {
    if (item.selfScore !== null || item.managerScore !== null) {
      const mgr = item.managerScore ?? 0;
      const slf = item.selfScore ?? 0;
      const finalScore = Math.round((mgr * item.managerWeight + slf * item.selfWeight) / 100 * 100) / 100;
      let level = 'D';
      if (finalScore >= 90) level = 'S';
      else if (finalScore >= 80) level = 'A';
      else if (finalScore >= 70) level = 'B';
      else if (finalScore >= 60) level = 'C';

      await assessItemRepo.update(item.id, { finalScore, level });
    }
  }
  console.log(`   - 已更新 ${allItems.length} 条考核明细项的得分和等级`);

  // 7. 创建流程日志
  console.log('\n📜 创建流程日志...');
  const flowLog = flowLogRepo.create({
    assessmentId: savedAssessment.id,
    fromNode: 'N1',
    toNode: 'N2',
    action: 'submit',
    operatorId: 5, // 员工提交
    remark: '员工完成自评，提交到主管审核',
  });
  await flowLogRepo.save(flowLog);
  console.log('   - 流程日志创建完成');

  // 8. 创建示例财务数据
  console.log('\n💰 创建示例财务数据...');
  const financeItems = [
    { deptId: 1, month: '2024-06', metricName: '月度研发支出(万元)', metricValue: 120.5, description: '研发部6月支出' },
    { deptId: 1, month: '2024-06', metricName: '项目完成率(%)', metricValue: 85.0, description: '6月项目完成率' },
    { deptId: 2, month: '2024-06', metricName: '月度收入(万元)', metricValue: 500.0, description: '6月公司收入' },
    { deptId: 2, month: '2024-06', metricName: '利润率(%)', metricValue: 25.5, description: '6月利润率' },
  ];
  await financeRepo.save(financeRepo.create(financeItems));
  console.log(`   - 创建 ${financeItems.length} 条财务数据`);

  // 关闭连接
  await dataSource.destroy();
  
  const defaultPwd = '123456';
  console.log('\n🎉 种子数据初始化完成！');
  console.log('📌 默认账号密码: 所有用户密码均为 ' + defaultPwd);
  console.log('   - chairman / 123456 (董事长)');
  console.log('   - finance_li / 123456 (财务负责人)');
  console.log('   - hr_wang / 123456 (HR专员)');
  console.log('   - rd_zhao / 123456 (研发经理)');
  console.log('   - emp_chen / 123456 (普通员工)');
}

main().catch(err => {
  console.error('❌ 种子数据初始化失败:', err);
  process.exit(1);
});
