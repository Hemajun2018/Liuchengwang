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
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'liuchengwang_secret_key',
        signOptions: {
          expiresIn: '7d', // 令牌有效期7天
        },
      }),
    }),
    RolesGuardModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {} 