import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from './roles.guard';
import { ProjectUser } from '../../database/entities/project-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectUser]),
  ],
  providers: [RolesGuard],
  exports: [
    RolesGuard,
    TypeOrmModule
  ],
})
export class RolesGuardModule {}