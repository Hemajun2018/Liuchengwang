import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliverableController } from './deliverable.controller';
import { DeliverableService } from './deliverable.service';
import { Deliverable } from '../../database/entities/deliverable.entity';
import { Node } from '../../database/entities/node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Deliverable, Node])],
  controllers: [DeliverableController],
  providers: [DeliverableService],
  exports: [DeliverableService],
})
export class DeliverableModule {} 