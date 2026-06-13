import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { LibraryItem } from '../../entities/library.entity';

/**
 * 绩效库管理模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([LibraryItem])],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
