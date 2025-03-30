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
    const project = this.projectRepository.create({
      name: createProjectDto.name,
      password: await bcrypt.hash(createProjectDto.password, 10),
      status: ProjectStatus.NOT_STARTED,
      days_needed: 0,
      created_by: currentUser?.id || null // 设置创建者ID
    });

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
            qb.where('project.created_by = :userId', { userId: user.id })
              .orWhere('projectUser.user_id = :userId', { userId: user.id });
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
          created_by: item.created_by
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
    start_time: string | Date;
    end_time: string | Date;
    days_needed: number;
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
    project.start_time = new Date(prerequisiteDto.start_time);
    project.end_time = new Date(prerequisiteDto.end_time);
    project.days_needed = prerequisiteDto.days_needed;
    project.status = status;

    console.log('准备保存的项目数据:', JSON.stringify({
      deliverables: project.deliverables,
      start_time: project.start_time,
      end_time: project.end_time,
      days_needed: project.days_needed,
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
        
        // 4. 单独获取源项目的节点（不使用关系加载，避免引用问题）
        const sourceNodes = await manager.find(Node, {
          where: { projectId: sourceId }
        });
        
        console.log(`找到源项目节点 ${sourceNodes.length} 个，开始复制`);
        
        // 创建节点ID映射表，用于后续设置节点之间的依赖关系
        const nodeIdMap = new Map();
        
        // 5. 复制每个节点
        for (const sourceNode of sourceNodes) {
          console.log(`处理源节点 ID:${sourceNode.id} 名称:${sourceNode.name}`);
          
          // 创建新节点（使用构造函数而不是create方法）
          const newNode = new Node();
          newNode.name = sourceNode.name;
          newNode.order = sourceNode.order;
          newNode.projectId = savedProject.id;  // 显式设置正确的项目ID
          newNode.isPrerequisite = sourceNode.isPrerequisite;
          newNode.isResult = sourceNode.isResult;
          newNode.createdAt = new Date();  // Node 使用驼峰命名
          newNode.updatedAt = new Date();  // Node 使用驼峰命名
          
          // 保存新节点并记录ID映射
          const savedNode = await manager.save(Node, newNode);
          nodeIdMap.set(sourceNode.id, savedNode.id);
          
          console.log(`新节点创建成功，ID:${savedNode.id} 关联到项目:${savedNode.projectId}`);
          
          // 6. 单独获取并复制该节点的问题
          const sourceIssues = await manager.find(Issue, {
            where: { node: { id: sourceNode.id } }
          });
          
          if (sourceIssues.length > 0) {
            console.log(`找到源节点问题 ${sourceIssues.length} 个，开始复制`);
            
            for (const sourceIssue of sourceIssues) {
              const newIssue = new Issue();
              // 根据实际实体定义设置属性
              newIssue.content = sourceIssue.content; // Issue有content属性而非description
              // 设置status字段，这是必须的，因为数据库中没有默认值
              newIssue.status = sourceIssue.status || 'pending'; // 如果源问题没有status，则设置为pending
              // 设置关联关系
              newIssue.node = savedNode;
              
              // Issue使用下划线命名
              newIssue.created_at = new Date();
              newIssue.updated_at = new Date();
              
              await manager.save(Issue, newIssue);
            }
          }
          
          // 7. 单独获取并复制该节点的材料
          const sourceMaterials = await manager.find(Material, {
            where: { node: { id: sourceNode.id } }
          });
          
          if (sourceMaterials.length > 0) {
            console.log(`找到源节点材料 ${sourceMaterials.length} 个，开始复制`);
            
            for (const sourceMaterial of sourceMaterials) {
              const newMaterial = new Material();
              newMaterial.name = sourceMaterial.name;
              newMaterial.url = sourceMaterial.url;
              newMaterial.type = sourceMaterial.type;
              // 设置关联关系
              newMaterial.node = savedNode;
              // Material 使用驼峰命名
              newMaterial.createdAt = new Date();
              newMaterial.updatedAt = new Date();
              
              await manager.save(Material, newMaterial);
            }
          }
          
          // 8. 单独获取并复制该节点的交付物
          const sourceDeliverables = await manager.find(Deliverable, {
            where: { node: { id: sourceNode.id } }
          });
          
          if (sourceDeliverables.length > 0) {
            console.log(`找到源节点交付物 ${sourceDeliverables.length} 个，开始复制`);
            
            for (const sourceDeliverable of sourceDeliverables) {
              const newDeliverable = new Deliverable();
              newDeliverable.description = sourceDeliverable.description;
              newDeliverable.status = sourceDeliverable.status;
              // 设置关联关系
              newDeliverable.node = savedNode;
              
              // Deliverable使用下划线命名
              newDeliverable.created_at = new Date();
              newDeliverable.updated_at = new Date();
              
              await manager.save(Deliverable, newDeliverable);
            }
          }
        }
        
        // 复制前置条件关系
        const sourcePrerequisites = await manager.query(
          `SELECT * FROM prerequisites WHERE project_id = ?`,
          [sourceId]
        );

        console.log('源项目前置条件查询结果:', JSON.stringify(sourcePrerequisites, null, 2));

        // 查询一下表结构，了解准确的字段名
        const tableStructure = await manager.query(
          `DESCRIBE prerequisites`
        );
        console.log('prerequisites表结构:', JSON.stringify(tableStructure, null, 2));

        if (sourcePrerequisites.length > 0) {
          console.log(`找到源项目前置条件 ${sourcePrerequisites.length} 个，开始复制`);
          
          // 打印节点映射表状态
          console.log('节点ID映射表内容:');
          for (const [oldId, newId] of nodeIdMap.entries()) {
            console.log(`原节点ID: ${oldId} (${typeof oldId}) -> 新节点ID: ${newId} (${typeof newId})`);
          }
          
          for (const prerequisite of sourcePrerequisites) {
            // 打印完整的前置条件数据以便调试
            console.log('前置条件原始数据:', JSON.stringify(prerequisite, null, 2));
            
            // 检查是否是项目前置条件（包含content字段）
            if (prerequisite.content) {
              console.log('识别到项目类型的前置条件:', prerequisite.content);
              
              try {
                // 复制项目级前置条件
                const newPrerequisite = {
                  project_id: savedProject.id,
                  content: prerequisite.content,
                  status: prerequisite.status || 'pending',
                  start_date: prerequisite.start_date,
                  expected_end_date: prerequisite.expected_end_date,
                  duration_days: prerequisite.duration_days,
                  created_at: new Date(),
                  updated_at: new Date()
                };
                
                const insertResult = await manager.query(
                  `INSERT INTO prerequisites (project_id, content, status, start_date, expected_end_date, duration_days, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    newPrerequisite.project_id, 
                    newPrerequisite.content, 
                    newPrerequisite.status,
                    newPrerequisite.start_date,
                    newPrerequisite.expected_end_date,
                    newPrerequisite.duration_days,
                    newPrerequisite.created_at,
                    newPrerequisite.updated_at
                  ]
                );
                console.log('项目前置条件插入成功:', insertResult);
              } catch (error) {
                console.error('插入项目前置条件失败:', error);
              }
              continue; // 继续处理下一个前置条件
            }
            
            // 检查所有可能的字段名，查找节点间前置关系
            let nodeId = null;
            let prerequisiteNodeId = null;
            
            // 遍历对象的所有属性，找到包含node_id或nodeId的字段
            for (const key in prerequisite) {
              console.log(`检查字段 ${key}: ${prerequisite[key]}`);
              
              if (key.toLowerCase().includes('node_id') || key.toLowerCase().includes('nodeid')) {
                if (key.toLowerCase().includes('prerequisite') || key.toLowerCase().includes('pre')) {
                  prerequisiteNodeId = prerequisite[key];
                  console.log(`找到前置节点ID字段: ${key} = ${prerequisiteNodeId}`);
                } else {
                  nodeId = prerequisite[key];
                  console.log(`找到节点ID字段: ${key} = ${nodeId}`);
                }
              }
            }
            
            if (!nodeId || !prerequisiteNodeId) {
              console.log('无法识别节点ID字段，尝试使用固定字段名：', prerequisite);
              nodeId = prerequisite.node_id;
              prerequisiteNodeId = prerequisite.prerequisite_node_id;
            }
            
            console.log(`转换前置条件 - 源节点ID: ${nodeId}, 前置节点ID: ${prerequisiteNodeId}`);
            
            // 确保ID是数字类型
            const newNodeId = nodeIdMap.get(Number(nodeId));
            const newPrerequisiteNodeId = nodeIdMap.get(Number(prerequisiteNodeId));
            
            console.log(`映射后的ID - 新节点ID: ${newNodeId}, 新前置节点ID: ${newPrerequisiteNodeId}`);
            
            // 只有当两个节点都成功复制时才创建前置条件
            if (newNodeId && newPrerequisiteNodeId) {
              console.log(`准备复制前置条件: 节点${newNodeId} 依赖于 节点${newPrerequisiteNodeId}`);
              
              try {
                const insertResult = await manager.query(
                  `INSERT INTO prerequisites (project_id, node_id, prerequisite_node_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?)`,
                  [savedProject.id, newNodeId, newPrerequisiteNodeId, new Date(), new Date()]
                );
                console.log('前置条件插入成功:', insertResult);
                
                // 检查插入是否成功
                const checkInsert = await manager.query(
                  `SELECT * FROM prerequisites WHERE project_id = ? AND node_id = ? AND prerequisite_node_id = ?`,
                  [savedProject.id, newNodeId, newPrerequisiteNodeId]
                );
                console.log('前置条件插入检查结果:', checkInsert);
              } catch (error) {
                console.error('插入前置条件失败:', error);
                // 不抛出异常，继续处理其他前置条件
              }
            } else {
              console.log(`跳过前置条件复制，节点ID不存在: ${nodeId} 或 ${prerequisiteNodeId}`);
            }
          }
        } else {
          console.log('源项目没有前置条件，无需复制');
        }
        
        // 现在查询额外的表来获取节点间的前置关系
        console.log('尝试查找节点间的前置关系...');
        try {
          // 先查询node_prerequisites表（如果存在）
          const nodePrerequisites = await manager.query(
            `SELECT * FROM node_prerequisites WHERE node_id IN (
              SELECT id FROM nodes WHERE project_id = ?
            )`,
            [sourceId]
          ).catch(err => {
            console.log('node_prerequisites表可能不存在:', err.message);
            return [];
          });
          
          if (nodePrerequisites.length > 0) {
            console.log(`找到节点前置关系 ${nodePrerequisites.length} 个，开始复制`);
            
            for (const relation of nodePrerequisites) {
              const newNodeId = nodeIdMap.get(Number(relation.node_id));
              const newPrerequisiteNodeId = nodeIdMap.get(Number(relation.prerequisite_node_id));
              
              if (newNodeId && newPrerequisiteNodeId) {
                const insertResult = await manager.query(
                  `INSERT INTO node_prerequisites (node_id, prerequisite_node_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?)`,
                  [newNodeId, newPrerequisiteNodeId, new Date(), new Date()]
                ).catch(err => {
                  console.error('插入节点前置关系失败:', err.message);
                  return null;
                });
                
                if (insertResult) {
                  console.log('节点前置关系插入成功:', insertResult);
                }
              }
            }
          } else {
            console.log('未找到节点前置关系或node_prerequisites表不存在');
          }
        } catch (error) {
          console.log('处理节点前置关系时出错:', error.message);
          // 忽略错误，继续执行
        }
        
        // 处理完成后，确保重新查询返回完整的项目数据
        const completedProject = await manager.findOne(Project, {
          where: { id: savedProject.id },
          relations: ['nodes']
        });
        
        console.log(`项目复制完成，新项目节点数量: ${completedProject.nodes?.length || 0}`);
        return completedProject;
      } catch (error) {
        console.error('复制项目失败:', error);
        throw error;
      }
    });
  }
} 