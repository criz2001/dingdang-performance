import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';

// 业务模块
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DeptModule } from './modules/dept/dept.module';
import { LibraryModule } from './modules/library/library.module';
import { AssessModule } from './modules/assess/assess.module';
import { ScoreModule } from './modules/score/score.module';
import { FlowModule } from './modules/flow/flow.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ReportModule } from './modules/report/report.module';

/**
 * 叮当绩效 - 应用根模块
 * 汇总所有业务模块和全局配置
 */
@Module({
  imports: [
    // 数据库连接（根据 .env 配置自动选择 SQLite 或 MySQL）
    TypeOrmModule.forRoot(getDatabaseConfig()),

    // 前端静态文件托管（生产模式）

    // 业务模块
    AuthModule,
    UserModule,
    DeptModule,
    LibraryModule,
    AssessModule,
    ScoreModule,
    FlowModule,
    FinanceModule,
    ReportModule,
  ],
})
export class AppModule {}
