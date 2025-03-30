import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../../database/entities/project.entity';
import * as bcrypt from 'bcrypt';
import { Node } from '../../database/entities/node.entity';
import { Issue } from '../../database/entities/issue.entity';
import { Material } from '../../database/entities/material.entity';
import { Deliverable } from '../../database/entities/deliverable.entity';
import { ProjectUser } from '../../database/entities/project-user.entity';
import { UserRole } from '../../database/entities/user.entity';
import { Brackets } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectUser)
    private projectUserRepository: Repository<ProjectUser>
  ) {}

  async create(createProjectDto: {
    name: string;
    password: string;
  }, currentUser?: any) {
    console.log('创建项目请求数据:', createProjectDto);

    // 检查项目名是否已存在
    const existingProject = await this.projectRepository.findOne({
      where: { name: createProjectDto.name }
    });

    if (existingProject) {
      console.log('项目名称已存在:', existingProject);
      throw new ConflictException('项目名称已存在');
    }

    // 创建新项目，包含必要字段
    const projectData = {
      name: createProjectDto.name,
      password: await bcrypt.hash(createProjectDto.password, 10),
      status: ProjectStatus.NOT_STARTED,
      days_needed: 0,
      created_by: currentUser?.id ? Number(currentUser.id) : null
    };

    const project = this.projectRepository.create(projectData);

    console.log('准备保存的项目数据:', project);

    try {
      const savedProject = await this.projectRepository.save(project);
      console.log('保存成功，返回数据:', savedProject);
      
      // 如果有当前用户信息，创建项目用户关联
      if (currentUser && currentUser.id) {
        try {
          await this.projectUserRepository.save({
            project_id: savedProject.id,
            user_id: currentUser.id,
            can_edit: true // 创建者默认有编辑权限
          });
        } catch (error) {
          console.error('创建项目用户关联失败:', error);
          // 不抛出异常，因为项目已经创建成功
        }
      }
      
      return savedProject;
    } catch (error) {
      console.error('保存项目时出错:', error);
      throw error;
    }
  }

  async findAll(params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
    user?: any;
  }) {
    try {
      const { page = 1, pageSize = 10, keyword, status, user } = params || {};
      
      console.log('开始查询项目列表，用户信息:', {
        用户ID: user?.id,
        用户角色: user?.role
      });

      // 构建查询条件
      const queryBuilder = this.projectRepository
        .createQueryBuilder('project')
        .select([
          'project.id',
          'project.name',
          'project.status',
          'project.deliverables',
          'project.start_time',
          'project.end_time',
          'project.days_needed',
          'project.created_at',
          'project.updated_at',
          'project.created_by'
        ]);
      
      // 如果不是超级管理员，只显示有权限的项目
      if (user && user.role !== UserRole.SUPER_ADMIN) {
        queryBuilder
          .leftJoin('project.projectUsers', 'projectUser')
          .where(new Brackets(qb => {
            qb.where('project.created_by = :userId', { userId: Number(user.id) })
              .orWhere('projectUser.user_id = :userId', { userId: Number(user.id) });
          }))
          .distinct(true);

        // 打印完整的SQL和参数
        const [sql, parameters] = queryBuilder.getQueryAndParameters();
        console.log('SQL查询:', sql);
        console.log('SQL参数:', parameters);
      }
      
      // 关键字搜索
      if (keyword) {
        queryBuilder.andWhere('project.name LIKE :keyword', { keyword: `%${keyword}%` });
      }
      
      // 状态过滤
      if (status) {
        queryBuilder.andWhere('project.status = :status', { status });
      }
      
      // 计算总数
      const total = await queryBuilder.getCount();
      
      // 分页查询
      const items = await queryBuilder
        .orderBy('project.created_at', 'DESC')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();

      console.log('查询结果:', {
        总数: total,
        当前页数据量: items.length,
        查询条件: {
          keyword,
          status,
          page,
          pageSize
        },
        项目列表: items.map(item => ({
          id: item.id,
          name: item.name,
          created_by: item.created_by ? Number(item.created_by) : null
        }))
      });
      
      return {
        items,
        total
      };
    } catch (error) {
      console.error('获取项目列表失败:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    console.log('查询单个项目，ID:', id);
    
    const project = await this.projectRepository.findOne({
      where: { id }
    });

    if (!project) {
      console.log('项目不存在');
      throw new NotFoundException('项目不存在');
    }

    console.log('查询到的项目:', project);
    return project;
  }

  async update(id: string, updateProjectDto: Partial<Project>) {
    console.log('开始更新项目, ID:', id);
    console.log('更新数据:', JSON.stringify(updateProjectDto, null, 2));
    
    // 查找项目
    const project = await this.findOne(id);
    console.log('找到现有项目:', JSON.stringify(project, null, 2));

    // 如果要更新密码，需要加密
    if (updateProjectDto.password) {
      updateProjectDto.password = await bcrypt.hash(updateProjectDto.password, 10);
    }

    // 处理日期字段
    if(updateProjectDto.start_time) {
      console.log('处理开始时间:', updateProjectDto.start_time);
      updateProjectDto.start_time = new Date(updateProjectDto.start_time);
    }
    if(updateProjectDto.end_time) {
      console.log('处理结束时间:', updateProjectDto.end_time);
      updateProjectDto.end_time = new Date(updateProjectDto.end_time);
    }

    // 合并更新
    Object.assign(project, updateProjectDto);
    console.log('合并后的数据:', JSON.stringify(project, null, 2));

    try {
      const updatedProject = await this.projectRepository.save(project);
      console.log('更新成功,返回数据:', JSON.stringify(updatedProject, null, 2));
      return updatedProject;
    } catch (error) {
      console.error('更新失败:', error);
      throw error;
    }
  }

  async remove(id: string) {
    console.log('删除项目，ID:', id);
    
    try {
      // 先查找项目，确认存在
      const project = await this.findOne(id);
      
      // 先删除与项目关联的前置条件记录
      // 使用原生SQL查询直接删除前置条件
      const deletePrerequisitesResult = await this.projectRepository.manager.query(
        `DELETE FROM prerequisites WHERE project_id = ?`,
        [id]
      );
      console.log('删除前置条件结果:', deletePrerequisitesResult);
      
      // 然后删除项目
      const result = await this.projectRepository.remove(project);
      console.log('项目删除成功，返回数据:', result);
      
      return result;
    } catch (error) {
      console.error('删除项目失败:', error);
      throw error;
    }
  }

  async verifyProject(name: string, password: string) {
    console.log('验证项目密码，项目名:', name);
    
    const project = await this.projectRepository.findOne({
      where: { name }
    });

    if (!project) {
      console.log('项目不存在');
      throw new NotFoundException('项目不存在');
    }

    const isPasswordValid = await bcrypt.compare(password, project.password);
    if (!isPasswordValid) {
      console.log('项目密码错误');
      throw new NotFoundException('项目密码错误');
    }

    console.log('验证成功，返回数据:', project);
    return project;
  }

  async updatePrerequisite(id: string, prerequisiteDto: {
    deliverables: string;
    status: number;
  }) {
    console.log('开始更新项目前置条件, ID:', id);
    console.log('前置条件数据:', JSON.stringify(prerequisiteDto, null, 2));

    // 查找项目
    const project = await this.findOne(id);
    
    // 确保status是有效的枚举值
    let status = prerequisiteDto.status;
    if (status === null || status === undefined) {
      status = 0; // 默认为未开始状态
      console.log('状态值为null或undefined，已设置为默认值0');
    }
    
    // 更新前置条件相关字段
    project.deliverables = prerequisiteDto.deliverables;
    project.status = status;

    console.log('准备保存的项目数据:', JSON.stringify({
      deliverables: project.deliverables,
      status: project.status
    }, null, 2));

    try {
      const updatedProject = await this.projectRepository.save(project);
      console.log('前置条件更新成功,返回数据:', JSON.stringify(updatedProject, null, 2));
      return updatedProject;
    } catch (error) {
      console.error('更新前置条件失败:', error);
      throw error;
    }
  }

  async updateResult(id: string, resultDto: {
    results: Array<{ id?: number; description: string }>
  }) {
    console.log('开始更新项目成果, ID:', id);
    console.log('成果数据:', JSON.stringify(resultDto, null, 2));

    // 查找项目
    const project = await this.findOne(id);
    
    // 更新成果字段
    project.results = resultDto.results;

    console.log('准备保存的项目数据:', JSON.stringify({
      results: project.results
    }, null, 2));

    try {
      const updatedProject = await this.projectRepository.save(project);
      console.log('成果更新成功,返回数据:', JSON.stringify(updatedProject, null, 2));
      return updatedProject;
    } catch (error) {
      console.error('更新成果失败:', error);
      throw error;
    }
  }

  async copyProject(sourceId: string, newProjectName: string) {
    // 使用事务确保数据一致性
    return await this.projectRepository.manager.transaction(async manager => {
      // 1. 获取源项目及其所有关联数据
      const sourceProject = await manager.findOne(Project, {
        where: { id: sourceId },
        relations: ['nodes', 'nodes.issues', 'nodes.materials', 'nodes.deliverables']
      });
      
      if (!sourceProject) {
        throw new NotFoundException('源项目不存在');
      }

      // 检查新项目名是否已存在
      const existingProject = await manager.findOne(Project, {
        where: { name: newProjectName }
      });

      if (existingProject) {
        throw new ConflictException('项目名称已存在');
      }

      // 2. 创建新项目
      const newProject = manager.create(Project, {
        ...sourceProject,
        id: undefined, // 让数据库生成新ID
        name: newProjectName,
        password: sourceProject.password, // 保持相同的密码
        created_at: new Date(),
        updated_at: new Date(),
        status: ProjectStatus.NOT_STARTED,
        days_needed: sourceProject.days_needed,
        created_by: sourceProject.created_by ? Number(sourceProject.created_by) : null
      } as Partial<Project>);
      
      // 3. 保存新项目
      const savedProject = await manager.save(Project, newProject);
      
      // 4. 复制节点及其关联数据
      if (sourceProject.nodes) {
        for (const sourceNode of sourceProject.nodes) {
          const newNode = manager.create(Node, {
            ...sourceNode,
            id: undefined,
            projectId: savedProject.id,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          // 保存新节点
          const savedNode = await manager.save(Node, newNode);
          
          // 复制issues
          if (sourceNode.issues) {
            for (const issue of sourceNode.issues) {
              await manager.save(Issue, {
                ...issue,
                id: undefined,
                nodeId: savedNode.id,
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          }
          
          // 复制materials
          if (sourceNode.materials) {
            for (const material of sourceNode.materials) {
              await manager.save(Material, {
                ...material,
                id: undefined,
                nodeId: savedNode.id,
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          }
          
          // 复制deliverables
          if (sourceNode.deliverables) {
            for (const deliverable of sourceNode.deliverables) {
              await manager.save(Deliverable, {
                ...deliverable,
                id: undefined,
                nodeId: savedNode.id,
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          }
        }
      }
      
      return savedProject;
    });
  }
} 