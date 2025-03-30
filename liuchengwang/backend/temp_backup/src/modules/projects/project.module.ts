import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from '../../database/entities/project.entity';
import { Node } from '../../database/entities/node.entity';
import { Issue } from '../../database/entities/issue.entity';
import { Material } from '../../database/entities/material.entity';
import { Deliverable } from '../../database/entities/deliverable.entity';
import { ProjectUser } from '../../database/entities/project-user.entity';
import { RolesGuardModule } from '../../common/guards/roles-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Node,
      Issue,
      Material,
      Deliverable,
      ProjectUser
    ]),
    RolesGuardModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}