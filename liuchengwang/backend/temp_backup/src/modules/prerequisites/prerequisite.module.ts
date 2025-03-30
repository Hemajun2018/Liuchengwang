import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrerequisiteController } from './prerequisite.controller';
import { PrerequisiteService } from './prerequisite.service';
import { Prerequisite } from '../../database/entities/prerequisite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prerequisite])],
  controllers: [PrerequisiteController],
  providers: [PrerequisiteService],
  exports: [PrerequisiteService]
})
export class PrerequisiteModule {} 