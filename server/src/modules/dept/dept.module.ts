import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeptController } from './dept.controller';
import { DeptService } from './dept.service';
import { Department } from '../../entities/dept.entity';

/**
 * 部门管理模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [DeptController],
  providers: [DeptService],
  exports: [DeptService],
})
export class DeptModule {}
