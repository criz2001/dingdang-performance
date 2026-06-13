import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FinanceData } from '../../entities/finance-data.entity';

/**
 * 财务数据管理模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([FinanceData])],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
