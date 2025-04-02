import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../../database/entities/project.entity';
import * as bcrypt from 'bcrypt';
import { Node } from '../../database/entities/node.entity';
import { Issue } from '../../database/entities/issue.entity';
import { Material } from '../../database/entities/material.entity';
import { Deliverable, DeliverableStatus } from '../../database/entities/deliverable.entity';
import { ProjectUser } from '../../database/entities/project-user.entity';
import { UserRole } from '../../database/entities/user.entity';
import { Brackets } from 'typeorm';
import { Prerequisite } from '../../database/entities/prerequisite.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectUser)
    private projectUserRepository: Repository<ProjectUser>,
    private readonly jwtService: JwtService
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
    console.log('密码:', password ? '已提供' : '未提供');
    
    // 查找项目，同时加载project_users关联
    const project = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.projectUsers', 'projectUsers')
      .where('project.name = :name', { name })
      .getOne();

    if (!project) {
      console.log('项目不存在');
      throw new NotFoundException('项目不存在');
    }

    console.log('找到项目:', project.id);
    
    const isPasswordValid = await bcrypt.compare(password, project.password);
    console.log('密码验证结果:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('项目密码错误');
      throw new NotFoundException('项目密码错误');
    }

    // 检查项目是否有关联的用户
    if (!project.projectUsers || project.projectUsers.length === 0) {
      console.log('项目没有关联的用户');
      throw new NotFoundException('项目访问权限错误');
    }

    // 生成JWT令牌
    const payload = { 
      id: project.id,
      name: project.name,
      type: 'project'
    };
    
    console.log('准备生成token，payload:', payload);
    const token = this.jwtService.sign(payload);
    console.log('项目验证成功，生成token:', token.substring(0, 20) + '...');

    // 返回项目信息和令牌，但不包含敏感信息
    const { password: _, projectUsers: __, ...projectInfo } = project;
    const result = {
      ...projectInfo,
      token
    };
    
    console.log('返回数据包含token:', !!result.token);
    return result;
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
    console.log('开始复制项目，源ID:', sourceId, '新名称:', newProjectName);
    
    return await this.projectRepository.manager.transaction(async manager => {
      try {
        // 1. 先获取源项目基本信息（不包含关系）
        const sourceProject = await manager.findOne(Project, {
          where: { id: sourceId }
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

        // 2. 创建新项目（只复制必要的属性）
        const newProject = new Project();
        newProject.name = newProjectName;
        newProject.password = sourceProject.password;
        newProject.deliverables = sourceProject.deliverables;
        newProject.status = ProjectStatus.NOT_STARTED;
        // 深度复制结果数组，避免引用问题
        newProject.results = sourceProject.results ? JSON.parse(JSON.stringify(sourceProject.results)) : undefined;
        newProject.created_at = new Date();  // Project 使用下划线命名
        newProject.updated_at = new Date();  // Project 使用下划线命名
        newProject.created_by = sourceProject.created_by;
        
        // 3. 保存新项目
        const savedProject = await manager.save(Project, newProject);
        console.log('新项目创建成功，ID:', savedProject.id);
        
        // 4. 先复制前置条件，因为它们独立于节点，直接关联到项目
        // 查找源项目的前置条件
        const sourcePrerequisites = await manager.find(Prerequisite, {
          where: { project_id: sourceId }
        });
        
        console.log(`找到源项目前置条件 ${sourcePrerequisites.length} 个，开始复制`);
        
        // 复制每个前置条件
        for (const sourcePrerequisite of sourcePrerequisites) {
          const newPrerequisite = new Prerequisite();
          newPrerequisite.content = sourcePrerequisite.content;
          newPrerequisite.project_id = savedProject.id;
          newPrerequisite.status = sourcePrerequisite.status || 'pending';
          newPrerequisite.start_date = sourcePrerequisite.start_date;
          newPrerequisite.expected_end_date = sourcePrerequisite.expected_end_date;
          newPrerequisite.duration_days = sourcePrerequisite.duration_days;
          newPrerequisite.created_at = new Date();
          newPrerequisite.updated_at = new Date();
          
          await manager.save(Prerequisite, newPrerequisite);
          console.log(`前置条件 "${newPrerequisite.content}" 复制成功`);
        }
        
        // 5. 单独获取源项目的节点（不使用关系加载，避免引用问题）
        const sourceNodes = await manager.find(Node, {
          where: { projectId: sourceId }
        });
        
        console.log(`找到源项目节点 ${sourceNodes.length} 个，开始复制`);
        
        // 创建节点ID映射表，用于后续设置节点之间的依赖关系
        const nodeIdMap = new Map();
        
        // 6. 复制每个节点
        for (const sourceNode of sourceNodes) {
          console.log(`处理源节点 ID:${sourceNode.id} 名称:${sourceNode.name}`);
          
          // 创建新节点
          const newNode = new Node();
          newNode.name = sourceNode.name;
          newNode.order = sourceNode.order;
          newNode.projectId = savedProject.id;  // 设置正确的项目ID
          newNode.isPrerequisite = sourceNode.isPrerequisite;
          newNode.isResult = sourceNode.isResult;
          newNode.createdAt = new Date();
          newNode.updatedAt = new Date();
          
          // 保存新节点并记录ID映射
          const savedNode = await manager.save(Node, newNode);
          nodeIdMap.set(sourceNode.id, savedNode.id);
          
          console.log(`新节点创建成功，ID:${savedNode.id} 关联到项目:${savedNode.projectId}`);
          
          // 7. 查询节点的问题
          const sourceIssues = await manager.find(Issue, {
            where: { node: { id: sourceNode.id } }
          });
          
          if (sourceIssues.length > 0) {
            console.log(`找到源节点问题 ${sourceIssues.length} 个，开始复制`);
            
            for (const sourceIssue of sourceIssues) {
              const newIssue = new Issue();
              newIssue.content = sourceIssue.content;
              newIssue.status = sourceIssue.status || 'pending';
              newIssue.node = savedNode;  // 设置node关系对象而不是直接设置ID
              newIssue.start_date = sourceIssue.start_date;
              newIssue.expected_end_date = sourceIssue.expected_end_date;
              newIssue.duration_days = sourceIssue.duration_days;
              newIssue.created_at = new Date();
              newIssue.updated_at = new Date();
              
              await manager.save(Issue, newIssue);
            }
          }
          
          // 8. 查询节点的材料
          const sourceMaterials = await manager.find(Material, {
            where: { nodeId: sourceNode.id }
          });
          
          if (sourceMaterials.length > 0) {
            console.log(`找到源节点材料 ${sourceMaterials.length} 个，开始复制`);
            
            for (const sourceMaterial of sourceMaterials) {
              const newMaterial = new Material();
              newMaterial.name = sourceMaterial.name;
              newMaterial.description = sourceMaterial.description;
              newMaterial.url = sourceMaterial.url;
              newMaterial.type = sourceMaterial.type;
              newMaterial.nodeId = savedNode.id;  // 使用正确的字段名nodeId
              newMaterial.start_date = sourceMaterial.start_date;
              newMaterial.expected_end_date = sourceMaterial.expected_end_date;
              newMaterial.duration_days = sourceMaterial.duration_days;
              newMaterial.status = sourceMaterial.status;
              newMaterial.createdAt = new Date();  // 使用正确的字段名createdAt
              newMaterial.updatedAt = new Date();  // 使用正确的字段名updatedAt
              
              await manager.save(Material, newMaterial);
            }
          }
          
          // 9. 查询节点的交付物
          const sourceDeliverables = await manager.find(Deliverable, {
            where: { node_id: sourceNode.id }
          });
          
          if (sourceDeliverables.length > 0) {
            console.log(`找到源节点交付物 ${sourceDeliverables.length} 个，开始复制`);
            
            for (const sourceDeliverable of sourceDeliverables) {
              const newDeliverable = new Deliverable();
              newDeliverable.description = sourceDeliverable.description;
              newDeliverable.status = sourceDeliverable.status || DeliverableStatus.NOT_STARTED;
              newDeliverable.node_id = savedNode.id;
              newDeliverable.start_date = sourceDeliverable.start_date;
              newDeliverable.expected_end_date = sourceDeliverable.expected_end_date;
              newDeliverable.duration_days = sourceDeliverable.duration_days;
              newDeliverable.created_at = new Date();
              newDeliverable.updated_at = new Date();
              
              await manager.save(Deliverable, newDeliverable);
            }
          }
        }
        
        // 处理完成后，确保重新查询返回完整的项目数据
        const completedProject = await manager.findOne(Project, {
          where: { id: savedProject.id }
        });
        
        console.log(`项目复制完成，新项目ID: ${completedProject.id}`);
        return completedProject;
      } catch (error) {
        console.error('复制项目失败:', error);
        throw error;
      }
    });
  }
} 