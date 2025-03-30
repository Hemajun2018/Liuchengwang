import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/projects/project.module';
import { NodeModule } from './modules/nodes/node.module';
import { PrerequisiteModule } from './modules/prerequisites/prerequisite.module';
import { DeliverableModule } from './modules/deliverables/deliverable.module';
import { User } from './modules/users/entities/user.entity';
import { Project } from './database/entities/project.entity';
import { Node } from './database/entities/node.entity';
import { Issue } from './database/entities/issue.entity';
import { Material } from './database/entities/material.entity';
import { Prerequisite } from './database/entities/prerequisite.entity';
import { Deliverable } from './database/entities/deliverable.entity';
import { ProjectUser } from './database/entities/project-user.entity';
import { ProjectUsersModule } from './modules/project-users/project-users.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'root'),
        database: configService.get('DB_DATABASE', 'liuchengwang'),
        entities: [User, Project, Node, Issue, Material, Prerequisite, Deliverable, ProjectUser],
        synchronize: false,
      }),
    }),
    
    // 业务模块
    UsersModule,
    AuthModule,
    ProjectModule,
    NodeModule,
    PrerequisiteModule,
    DeliverableModule,
    ProjectUsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 