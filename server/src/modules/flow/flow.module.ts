import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowController } from './flow.controller';
import { FlowService } from './flow.service';
import { Assessment } from '../../entities/assessment.entity';
import { FlowLog } from '../../entities/flow-log.entity';

/**
 * 流程引擎模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Assessment, FlowLog])],
  controllers: [FlowController],
  providers: [FlowService],
  exports: [FlowService],
})
export class FlowModule {}
