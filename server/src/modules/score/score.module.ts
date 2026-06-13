import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { AssessmentItem } from '../../entities/assessment-item.entity';
import { Score } from '../../entities/score.entity';

/**
 * 评分管理模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([AssessmentItem, Score])],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
