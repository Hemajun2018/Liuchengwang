import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectUsersService } from './project-users.service';
import { ProjectUsersController } from './project-users.controller';
import { ProjectUser } from '../../database/entities/project-user.entity';
import { RolesGuardModule } from '../../common/guards/roles-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectUser]),
    RolesGuardModule,
  ],
  controllers: [ProjectUsersController],
  providers: [ProjectUsersService],
  exports: [ProjectUsersService],
})
export class ProjectUsersModule {}