import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../modules/users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectUser } from '../../database/entities/project-user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(ProjectUser)
    private projectUserRepository: Repository<ProjectUser>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // 如果没有角色要求，允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // 确保用户已经通过认证
    if (!user) {
      throw new ForbiddenException('未授权访问');
    }
    
    // 超级管理员可以访问所有内容
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    // 检查用户角色是否满足要求
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (hasRequiredRole) {
      return true;
    }
    
    // 检查项目特定权限
    const projectId = request.params.id || request.query.projectId;
    if (projectId && (user.role === UserRole.PROJECT_ADMIN || user.role === UserRole.CONTENT_ADMIN)) {
      const projectUser = await this.projectUserRepository.findOne({
        where: { project_id: projectId, user_id: user.id }
      });
      
      if (projectUser) {
        // PROJECT_ADMIN可以编辑所有内容
        if (user.role === UserRole.PROJECT_ADMIN) {
          return true;
        }
        
        // CONTENT_ADMIN只能编辑内容，不能修改项目设置
        if (user.role === UserRole.CONTENT_ADMIN && 
            !['PUT', 'PATCH', 'DELETE'].includes(request.method)) {
          return true;
        }
      }
    }
    
    throw new ForbiddenException('您没有权限执行此操作');
  }
} 