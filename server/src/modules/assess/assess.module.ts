import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessController } from './assess.controller';
import { AssessService } from './assess.service';
import { Assessment } from '../../entities/assessment.entity';
import { AssessmentItem } from '../../entities/assessment-item.entity';
import { User } from '../../entities/user.entity';
import { LibraryItem } from '../../entities/library.entity';

/**
 * 月度考核管理模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Assessment, AssessmentItem, User, LibraryItem])],
  controllers: [AssessController],
  providers: [AssessService],
  exports: [AssessService],
})
export class AssessModule {}
