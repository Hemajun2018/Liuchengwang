import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectUser } from '../../database/entities/project-user.entity';

@Injectable()
export class ProjectUsersService {
  constructor(
    @InjectRepository(ProjectUser)
    private projectUserRepository: Repository<ProjectUser>,
  ) {}

  async findAll(params: { projectId?: string; userId?: number }) {
    const { projectId, userId } = params;
    
    console.log('开始查询项目用户, 参数:', params);
    
    try {
      // 构建查询条件
      const where: any = {};
      
      // 验证并添加projectId条件
      if (projectId) {
        where.project_id = projectId;
      }
      
      // 验证并添加userId条件
      if (userId) {
        const numericUserId = Number(userId);
        if (isNaN(numericUserId) || numericUserId <= 0) {
          console.warn('无效的用户ID:', userId);
          return [];
        }
        where.user_id = numericUserId;
      }
      
      // 使用Repository的find方法直接查询
      const projectUsers = await this.projectUserRepository.find({
        where,
        relations: ['user', 'project'],
        order: {
          createdAt: 'DESC'
        }
      });
      
      console.log(`查询完成, 找到 ${projectUsers.length} 条记录`);
      return projectUsers;
      
    } catch (error) {
      console.error('查询项目用户时出错:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        params
      });
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      // 严格的参数验证
      if (id === undefined || id === null) {
        throw new NotFoundException('项目用户ID不能为空');
      }
      
      const numericId = Number(id);
      if (isNaN(numericId) || numericId <= 0) {
        throw new NotFoundException(`无效的项目用户ID: ${id}`);
      }

      // 使用 findOneBy 替代 findOne
      const projectUser = await this.projectUserRepository.findOneBy({
        id: numericId
      });
      
      if (!projectUser) {
        throw new NotFoundException(`未找到ID为 ${id} 的项目用户关联`);
      }
      
      // 加载关联数据
      const projectUserWithRelations = await this.projectUserRepository.findOne({
        where: { id: numericId },
        relations: ['user', 'project']
      });
      
      return projectUserWithRelations;
    } catch (error) {
      console.error('查询项目用户失败:', error);
      throw error;
    }
  }

  async findByProjectAndUser(projectId: string, userId: number) {
    if (!projectId || !userId) {
      throw new NotFoundException('项目ID和用户ID不能为空');
    }

    const numericUserId = Number(userId);
    if (isNaN(numericUserId) || numericUserId <= 0) {
      throw new NotFoundException(`无效的用户ID: ${userId}`);
    }

    return this.projectUserRepository.findOne({
      where: { 
        project_id: projectId, 
        user_id: numericUserId 
      },
      relations: ['user', 'project']
    });
  }

  async create(data: { projectId: string; userId: number; can_edit: boolean }) {
    const { projectId, userId, can_edit } = data;
    
    // 检查是否已存在
    const existingRecord = await this.projectUserRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    });
    
    if (existingRecord) {
      existingRecord.can_edit = can_edit;
      return this.projectUserRepository.save(existingRecord);
    }
    
    // 创建新记录
    const projectUser = this.projectUserRepository.create({
      project_id: projectId,
      user_id: userId,
      can_edit,
    });
    
    return this.projectUserRepository.save(projectUser);
  }

  async update(id: number, can_edit: boolean) {
    const projectUser = await this.findOne(id);
    projectUser.can_edit = can_edit;
    return this.projectUserRepository.save(projectUser);
  }

  async remove(id: number) {
    const projectUser = await this.findOne(id);
    return this.projectUserRepository.remove(projectUser);
  }

  async removeByProjectAndUser(projectId: string, userId: number) {
    const projectUser = await this.findByProjectAndUser(projectId, userId);
    
    if (!projectUser) {
      throw new NotFoundException(`未找到项目ID ${projectId} 和用户ID ${userId} 的关联`);
    }
    
    return this.projectUserRepository.remove(projectUser);
  }
} 