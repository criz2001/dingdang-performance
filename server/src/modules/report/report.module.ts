import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Assessment } from '../../entities/assessment.entity';
import { AssessmentItem } from '../../entities/assessment-item.entity';
import { User } from '../../entities/user.entity';
import { Department } from '../../entities/dept.entity';

/**
 * 报告统计模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Assessment, AssessmentItem, User, Department])],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
