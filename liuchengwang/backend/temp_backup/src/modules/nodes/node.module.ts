import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { Node } from '../../database/entities/node.entity';
import { Issue } from '../../database/entities/issue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Node, Issue])],
  controllers: [NodeController],
  providers: [NodeService],
  exports: [NodeService],
})
export class NodeModule {}