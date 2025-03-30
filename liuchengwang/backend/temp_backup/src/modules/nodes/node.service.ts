import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Node, NodeStatus } from '../../database/entities/node.entity';
import { Issue, IssueStatus } from '../../database/entities/issue.entity';
import { Material, MaterialType, MaterialStatus } from '../../database/entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';

@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name);

  constructor(
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  async create(projectId: string, data: {
    name: string;
    description: string;
    descriptions?: string[];
    order: number;
    startTime?: Date;
    endTime?: Date;
    daysNeeded?: number;
    isPrerequisite?: boolean;
    isResult?: boolean;
    expectedEndDate?: Date;
  }): Promise<Node> {
    this.logger.log('=== 节点服务：开始创建节点 ===');
    this.logger.log(`项目ID: ${projectId}`);
    this.logger.log(`节点数据: ${JSON.stringify(data, null, 2)}`);

    try {
      // 如果提供了开始和结束时间，但没有提供天数，则自动计算
      if (data.startTime && data.endTime) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const daysNeeded = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this.logger.log(`自动计算所需天数: ${daysNeeded}`);
      }

      const node = this.nodeRepository.create({
        projectId,
        name: data.name,
        description: data.description,
        descriptions: data.descriptions,
        order: data.order,
        status: NodeStatus.NOT_STARTED,
        startTime: data.startTime,
        endTime: data.endTime,
        daysNeeded: data.daysNeeded || 0,
        isPrerequisite: data.isPrerequisite || false,
        isResult: data.isResult || false,
        expectedEndDate: data.expectedEndDate
      });

      this.logger.log(`准备保存节点: ${JSON.stringify(node, null, 2)}`);
      const savedNode = await this.nodeRepository.save(node);
      this.logger.log(`节点保存成功: ${JSON.stringify(savedNode, null, 2)}`);
      this.logger.log('=== 节点服务：节点创建完成 ===\n');
      return savedNode;
    } catch (error) {
      this.logger.error(`节点创建失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点服务：节点创建异常 ===\n');
      throw error;
    }
  }

  async findAll(projectId: string): Promise<Node[]> {
    this.logger.log('=== 节点服务：开始获取节点列表 ===');
    this.logger.log(`项目ID: ${projectId}`);

    try {
      const nodes = await this.nodeRepository.find({
        where: { projectId },
        relations: ['issues', 'materials', 'deliverables'],
        order: { order: 'ASC' }
      });
      
      this.logger.log(`获取到 ${nodes.length} 个节点`);
      nodes.forEach(node => {
        this.logger.debug(`节点 ${node.id} (${node.name}) 的交付内容数量: ${node.deliverables?.length || 0}`);
      });
      
      this.logger.log(`节点列表: ${JSON.stringify(nodes, null, 2)}`);
      this.logger.log('=== 节点服务：节点列表获取完成 ===\n');
      return nodes;
    } catch (error) {
      this.logger.error(`获取节点列表失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点服务：节点列表获取异常 ===\n');
      throw error;
    }
  }

  async findOne(projectId: string, id: number): Promise<Node> {
    this.logger.log(`查询单个节点, 项目ID: ${projectId}, 节点ID: ${id}`);
    
    try {
      const node = await this.nodeRepository.findOne({
        where: { projectId, id },
        relations: ['issues', 'materials', 'deliverables']
      });
      
      if (!node) {
        this.logger.error(`节点不存在, 项目ID: ${projectId}, 节点ID: ${id}`);
        throw new NotFoundException(`节点 #${id} 不存在`);
      }
      
      // 添加调试日志
      this.logger.debug(`找到节点: ${node.id} (${node.name})`);
      this.logger.debug(`节点的交付内容数量: ${node.deliverables?.length || 0}`);
      
      if (node.deliverables && node.deliverables.length > 0) {
        this.logger.debug(`节点的第一个交付内容: ${JSON.stringify(node.deliverables[0])}`);
      }
      
      return node;
    } catch (error) {
      this.logger.error(`查询单个节点失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(projectId: string, id: number, data: UpdateNodeDto): Promise<Node> {
    this.logger.log('=== 节点服务：开始更新节点 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${id}`);
    this.logger.log(`更新数据: ${JSON.stringify(data, null, 2)}`);

    try {
      const updateResult = await this.nodeRepository.update(
        { projectId, id },
        {
          name: data.name,
          order: data.order,
          isPrerequisite: data.isPrerequisite,
          isResult: data.isResult
        },
      );

      this.logger.log(`更新结果: ${JSON.stringify(updateResult, null, 2)}`);
      
      if (updateResult.affected === 0) {
        this.logger.warn('未找到要更新的节点');
        this.logger.log('=== 节点服务：节点更新完成 ===\n');
        return null;
      }

      const updatedNode = await this.findOne(projectId, id);
      this.logger.log(`更新后的节点: ${JSON.stringify(updatedNode, null, 2)}`);
      this.logger.log('=== 节点服务：节点更新完成 ===\n');
      return updatedNode;
    } catch (error) {
      this.logger.error(`更新节点失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点服务：节点更新异常 ===\n');
      throw error;
    }
  }

  async remove(projectId: string, id: number): Promise<void> {
    this.logger.log('=== 节点服务：开始删除节点 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${id}`);

    try {
      const deleteResult = await this.nodeRepository.delete({ projectId, id });
      
      this.logger.log(`删除结果: ${JSON.stringify(deleteResult, null, 2)}`);
      
      if (deleteResult.affected === 0) {
        this.logger.warn('未找到要删除的节点');
      } else {
        this.logger.log('节点删除成功');
      }
      
      this.logger.log('=== 节点服务：节点删除完成 ===\n');
    } catch (error) {
      this.logger.error(`删除节点失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点服务：节点删除异常 ===\n');
      throw error;
    }
  }

  async updateOrder(projectId: string, nodeIds: number[]): Promise<void> {
    this.logger.log('=== 节点服务：开始更新节点顺序 ===');
    this.logger.log(`项目ID: ${projectId}`);
    this.logger.log(`节点顺序: ${JSON.stringify(nodeIds, null, 2)}`);

    const queryRunner = this.nodeRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i];
        const order = i + 1;
        
        this.logger.log(`更新节点 ${nodeId} 的顺序为 ${order}`);
        
        await queryRunner.manager.update(
          Node,
          { projectId, id: nodeId },
          { order }
        );
      }
      
      await queryRunner.commitTransaction();
      this.logger.log('节点顺序更新成功');
      this.logger.log('=== 节点服务：节点顺序更新完成 ===\n');
    } catch (error) {
      this.logger.error(`更新节点顺序失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点服务：节点顺序更新异常 ===\n');
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 问题相关服务方法
  async createIssue(
    projectId: string,
    nodeId: number,
    createIssueDto: {
      content: string;
      status: string;
      start_date?: string | null;
      expected_end_date?: string | null;
      duration_days?: number | null;
    },
  ): Promise<Issue> {
    this.logger.log('=== 开始保存问题 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);
    this.logger.log(`创建数据: ${JSON.stringify(createIssueDto, null, 2)}`);

    const node = await this.nodeRepository.findOne({
      where: { id: nodeId, project: { id: projectId } },
    });

    if (!node) {
      throw new Error('节点不存在');
    }

    // 处理日期和持续天数
    let duration_days = createIssueDto.duration_days;
    if (createIssueDto.start_date && createIssueDto.expected_end_date) {
      const start = new Date(createIssueDto.start_date);
      const end = new Date(createIssueDto.expected_end_date);
      if (end < start) {
        throw new Error('结束日期不能早于开始日期');
      }
      const diffTime = Math.abs(end.getTime() - start.getTime());
      duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const issue = new Issue();
    issue.content = createIssueDto.content;
    issue.status = createIssueDto.status;
    issue.start_date = createIssueDto.start_date ? new Date(createIssueDto.start_date) : null;
    issue.expected_end_date = createIssueDto.expected_end_date ? new Date(createIssueDto.expected_end_date) : null;
    issue.duration_days = duration_days;
    issue.node = node;

    const savedIssue = await this.issueRepository.save(issue);
    this.logger.log(`问题保存成功: ${JSON.stringify(savedIssue, null, 2)}`);
    return savedIssue;
  }

  async updateIssue(
    projectId: string,
    nodeId: number,
    issueId: number,
    updateIssueDto: {
      content?: string;
      status?: string;
      start_date?: string | null;
      expected_end_date?: string | null;
      duration_days?: number | null;
    },
  ): Promise<Issue> {
    this.logger.log('=== 开始更新问题 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 问题ID: ${issueId}`);
    this.logger.log(`更新数据: ${JSON.stringify(updateIssueDto, null, 2)}`);

    const issue = await this.issueRepository.findOne({
      where: { id: issueId, node: { id: nodeId, project: { id: projectId } } },
    });

    if (!issue) {
      throw new Error('问题不存在');
    }

    if (updateIssueDto.content) {
      issue.content = updateIssueDto.content;
    }

    if (updateIssueDto.status) {
      issue.status = updateIssueDto.status;
    }

    // 处理日期和持续天数
    if (updateIssueDto.start_date !== undefined) {
      issue.start_date = updateIssueDto.start_date ? new Date(updateIssueDto.start_date) : null;
    }

    if (updateIssueDto.expected_end_date !== undefined) {
      issue.expected_end_date = updateIssueDto.expected_end_date ? new Date(updateIssueDto.expected_end_date) : null;
    }

    // 重新计算持续天数
    if (issue.start_date && issue.expected_end_date) {
      const diffTime = Math.abs(issue.expected_end_date.getTime() - issue.start_date.getTime());
      issue.duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      issue.duration_days = null;
    }

    const updatedIssue = await this.issueRepository.save(issue);
    this.logger.log(`问题更新成功: ${JSON.stringify(updatedIssue, null, 2)}`);
    return updatedIssue;
  }

  // 验证日期字符串格式 (YYYY-MM-DD)
  private isValidDateString(dateStr: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // 计算时间间隔（天数）
  private calculateDuration(startDate: string | null, endDate: string | null): number | null {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async getIssues(projectId: string, nodeId: number): Promise<Issue[]> {
    this.logger.log('=== 节点服务：开始获取问题列表 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);

    try {
      // 检查节点是否存在
      const node = await this.findOne(projectId, nodeId);
      if (!node) {
        throw new Error('节点不存在');
      }

      const issues = await this.issueRepository.find({
        where: { node: { id: nodeId } },
        order: { created_at: 'DESC' },
      });

      this.logger.log(`获取到 ${issues.length} 个问题`);
      this.logger.log(`问题列表: ${JSON.stringify(issues, null, 2)}`);
      this.logger.log('=== 节点服务：问题列表获取完成 ===\n');
      return issues;
    } catch (error) {
      this.logger.error(`获取问题列表失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点服务：问题列表获取异常 ===\n');
      throw error;
    }
  }

  async deleteIssue(projectId: string, nodeId: number, issueId: number): Promise<void> {
    this.logger.log('=== 节点服务：开始删除问题 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 问题ID: ${issueId}`);

    try {
      // 检查节点是否存在
      const node = await this.findOne(projectId, nodeId);
      if (!node) {
        throw new Error('节点不存在');
      }

      // 检查问题是否存在
      const issue = await this.issueRepository.findOne({
        where: { id: issueId, node: { id: nodeId } },
      });

      if (!issue) {
        throw new Error('问题不存在');
      }

      const deleteResult = await this.issueRepository.delete({ id: issueId });
      
      if (deleteResult.affected === 0) {
        throw new Error('问题删除失败');
      }

      this.logger.log('问题删除成功');
      this.logger.log('=== 节点服务：问题删除完成 ===\n');
    } catch (error) {
      this.logger.error(`删除问题失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点服务：问题删除异常 ===\n');
      throw error;
    }
  }

  // Material相关服务方法
  async createMaterial(
    projectId: string,
    nodeId: number,
    createMaterialDto: CreateMaterialDto,
  ): Promise<Material> {
    this.logger.log('=== 开始创建材料 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);
    this.logger.log(`创建数据: ${JSON.stringify(createMaterialDto, null, 2)}`);

    try {
      // 检查节点是否存在
      const node = await this.nodeRepository.findOne({
        where: { id: nodeId, projectId },
      });

      if (!node) {
        throw new Error('节点不存在');
      }

      // 处理日期和持续天数
      let duration_days = createMaterialDto.duration_days;
      if (createMaterialDto.start_date && createMaterialDto.expected_end_date) {
        const start = new Date(createMaterialDto.start_date);
        const end = new Date(createMaterialDto.expected_end_date);
        if (end < start) {
          throw new Error('结束日期不能早于开始日期');
        }
        const diffTime = Math.abs(end.getTime() - start.getTime());
        duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // 创建材料实体
      const material = new Material();
      material.name = createMaterialDto.name;
      material.description = createMaterialDto.description;
      material.url = createMaterialDto.url;
      material.type = createMaterialDto.type || MaterialType.DOCUMENT;
      material.fileSize = createMaterialDto.fileSize;
      material.start_date = createMaterialDto.start_date ? new Date(createMaterialDto.start_date) : null;
      material.expected_end_date = createMaterialDto.expected_end_date ? new Date(createMaterialDto.expected_end_date) : null;
      material.duration_days = duration_days;
      material.status = createMaterialDto.status || MaterialStatus.NOT_STARTED;
      material.node = node;

      const savedMaterial = await this.materialRepository.save(material);
      this.logger.log(`材料创建成功: ${JSON.stringify(savedMaterial, null, 2)}`);
      this.logger.log('=== 材料创建完成 ===\n');
      return savedMaterial;
    } catch (error) {
      this.logger.error(`创建材料失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 材料创建异常 ===\n');
      throw error;
    }
  }

  async getMaterials(projectId: string, nodeId: number): Promise<Material[]> {
    this.logger.log('=== 开始获取材料列表 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);

    try {
      // 检查节点是否存在
      const node = await this.findOne(projectId, nodeId);
      if (!node) {
        throw new Error('节点不存在');
      }

      const materials = await this.materialRepository.find({
        where: { node: { id: nodeId } },
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`获取到 ${materials.length} 个材料`);
      this.logger.log(`材料列表: ${JSON.stringify(materials, null, 2)}`);
      this.logger.log('=== 材料列表获取完成 ===\n');
      return materials;
    } catch (error) {
      this.logger.error(`获取材料列表失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 材料列表获取异常 ===\n');
      throw error;
    }
  }

  async getMaterial(projectId: string, nodeId: number, materialId: number): Promise<Material> {
    this.logger.log('=== 开始获取单个材料 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 材料ID: ${materialId}`);

    try {
      // 检查节点是否存在
      const node = await this.findOne(projectId, nodeId);
      if (!node) {
        throw new Error('节点不存在');
      }

      const material = await this.materialRepository.findOne({
        where: { id: materialId, node: { id: nodeId } },
      });

      if (!material) {
        this.logger.warn('未找到指定材料');
        return null;
      }

      this.logger.log(`获取到材料: ${JSON.stringify(material, null, 2)}`);
      this.logger.log('=== 材料获取完成 ===\n');
      return material;
    } catch (error) {
      this.logger.error(`获取材料失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 材料获取异常 ===\n');
      throw error;
    }
  }

  async updateMaterial(
    projectId: string,
    nodeId: number,
    materialId: number,
    updateMaterialDto: UpdateMaterialDto,
  ): Promise<Material> {
    this.logger.log('=== 开始更新材料 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 材料ID: ${materialId}`);
    this.logger.log(`更新数据: ${JSON.stringify(updateMaterialDto, null, 2)}`);

    try {
      // 检查节点是否存在
      const node = await this.findOne(projectId, nodeId);
      if (!node) {
        throw new Error('节点不存在');
      }

      // 获取现有材料
      const material = await this.materialRepository.findOne({
        where: { id: materialId, node: { id: nodeId } },
      });

      if (!material) {
        throw new Error('材料不存在');
      }

      // 更新材料字段
      if (updateMaterialDto.name !== undefined) {
        material.name = updateMaterialDto.name;
      }

      if (updateMaterialDto.description !== undefined) {
        material.description = updateMaterialDto.description;
      }

      if (updateMaterialDto.url !== undefined) {
        material.url = updateMaterialDto.url;
      }

      if (updateMaterialDto.type !== undefined) {
        material.type = updateMaterialDto.type;
      }

      if (updateMaterialDto.fileSize !== undefined) {
        material.fileSize = updateMaterialDto.fileSize;
      }

      if (updateMaterialDto.start_date !== undefined) {
        material.start_date = updateMaterialDto.start_date ? new Date(updateMaterialDto.start_date) : null;
      }

      if (updateMaterialDto.expected_end_date !== undefined) {
        material.expected_end_date = updateMaterialDto.expected_end_date ? new Date(updateMaterialDto.expected_end_date) : null;
      }

      if (updateMaterialDto.status !== undefined) {
        material.status = updateMaterialDto.status;
      }

      // 处理日期和持续天数
      if (material.start_date && material.expected_end_date) {
        const diffTime = Math.abs(material.expected_end_date.getTime() - material.start_date.getTime());
        material.duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (updateMaterialDto.duration_days !== undefined) {
        material.duration_days = updateMaterialDto.duration_days;
      }

      const updatedMaterial = await this.materialRepository.save(material);
      this.logger.log(`材料更新成功: ${JSON.stringify(updatedMaterial, null, 2)}`);
      this.logger.log('=== 材料更新完成 ===\n');
      return updatedMaterial;
    } catch (error) {
      this.logger.error(`更新材料失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 材料更新异常 ===\n');
      throw error;
    }
  }

  async deleteMaterial(projectId: string, nodeId: number, materialId: number): Promise<void> {
    this.logger.log('=== 开始删除材料 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 材料ID: ${materialId}`);

    try {
      // 检查节点是否存在
      const node = await this.findOne(projectId, nodeId);
      if (!node) {
        throw new Error('节点不存在');
      }

      // 检查材料是否存在
      const material = await this.materialRepository.findOne({
        where: { id: materialId, node: { id: nodeId } },
      });

      if (!material) {
        throw new Error('材料不存在');
      }

      const deleteResult = await this.materialRepository.delete(materialId);
      
      if (deleteResult.affected === 0) {
        throw new Error('材料删除失败');
      }

      this.logger.log('材料删除成功');
      this.logger.log('=== 材料删除完成 ===\n');
    } catch (error) {
      this.logger.error(`删除材料失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 材料删除异常 ===\n');
      throw error;
    }
  }
} 