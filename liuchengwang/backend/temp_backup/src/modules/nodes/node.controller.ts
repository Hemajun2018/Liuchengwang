import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { NodeService } from './node.service';
import { Node } from '../../database/entities/node.entity';
import { Issue } from '../../database/entities/issue.entity';
import { Material } from '../../database/entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Controller('projects/:projectId/nodes')
export class NodeController {
  private readonly logger = new Logger(NodeController.name);
  
  constructor(private readonly nodeService: NodeService) {}

  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Body() createNodeDto: {
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
    },
  ): Promise<Node> {
    this.logger.log('=== 开始创建节点 ===');
    this.logger.log(`项目ID: ${projectId}`);
    this.logger.log(`请求参数: ${JSON.stringify(createNodeDto, null, 2)}`);

    try {
      const node = await this.nodeService.create(projectId, createNodeDto);
      this.logger.log(`节点创建成功: ${JSON.stringify(node, null, 2)}`);
      this.logger.log('=== 节点创建完成 ===\n');
      return node;
    } catch (error) {
      this.logger.error(`节点创建失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点创建异常 ===\n');
      throw error;
    }
  }

  @Get()
  async findAll(@Param('projectId') projectId: string): Promise<Node[]> {
    this.logger.log('=== 开始获取节点列表 ===');
    this.logger.log(`项目ID: ${projectId}`);

    try {
      const nodes = await this.nodeService.findAll(projectId);
      this.logger.log(`获取到 ${nodes.length} 个节点`);
      this.logger.log(`节点列表: ${JSON.stringify(nodes, null, 2)}`);
      this.logger.log('=== 节点列表获取完成 ===\n');
      return nodes;
    } catch (error) {
      this.logger.error(`获取节点列表失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点列表获取异常 ===\n');
      throw error;
    }
  }

  @Get(':id')
  async findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ): Promise<Node> {
    this.logger.log('=== 开始获取单个节点 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${id}`);

    try {
      const node = await this.nodeService.findOne(projectId, +id);
      this.logger.log(`获取到节点: ${JSON.stringify(node, null, 2)}`);
      this.logger.log('=== 节点获取完成 ===\n');
      return node;
    } catch (error) {
      this.logger.error(`获取节点失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点获取异常 ===\n');
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateNodeDto: Partial<Node>,
  ): Promise<Node> {
    this.logger.log('=== 开始更新节点 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${id}`);
    this.logger.log(`更新数据: ${JSON.stringify(updateNodeDto, null, 2)}`);

    try {
      const node = await this.nodeService.update(projectId, +id, updateNodeDto);
      this.logger.log(`节点更新成功: ${JSON.stringify(node, null, 2)}`);
      this.logger.log('=== 节点更新完成 ===\n');
      return node;
    } catch (error) {
      this.logger.error(`更新节点失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点更新异常 ===\n');
      throw error;
    }
  }

  @Delete(':id')
  async remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ): Promise<void> {
    this.logger.log('=== 开始删除节点 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${id}`);

    try {
      await this.nodeService.remove(projectId, +id);
      this.logger.log('节点删除成功');
      this.logger.log('=== 节点删除完成 ===\n');
    } catch (error) {
      this.logger.error(`删除节点失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点删除异常 ===\n');
      throw error;
    }
  }

  @Post('reorder')
  async updateOrder(
    @Param('projectId') projectId: string,
    @Body() data: { nodeIds: number[] },
  ): Promise<void> {
    this.logger.log('=== 开始更新节点顺序 ===');
    this.logger.log(`项目ID: ${projectId}`);
    this.logger.log(`节点顺序: ${JSON.stringify(data.nodeIds)}`);

    try {
      await this.nodeService.updateOrder(projectId, data.nodeIds);
      this.logger.log('节点顺序更新成功');
      this.logger.log('=== 节点顺序更新完成 ===\n');
    } catch (error) {
      this.logger.error(`更新节点顺序失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 节点顺序更新异常 ===\n');
      throw error;
    }
  }

  // 问题相关API
  @Post(':nodeId/issues')
  async createIssue(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Body() createIssueDto: {
      content: string;
      status: string;
      start_date?: string | null;
      expected_end_date?: string | null;
      duration_days?: number | null;
    },
  ): Promise<Issue> {
    this.logger.log('=== 开始创建问题 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);
    this.logger.log(`请求参数: ${JSON.stringify(createIssueDto, null, 2)}`);

    try {
      if (!createIssueDto.content) {
        throw new Error('问题描述不能为空');
      }

      const issue = await this.nodeService.createIssue(projectId, +nodeId, createIssueDto);
      this.logger.log(`问题创建成功: ${JSON.stringify(issue, null, 2)}`);
      return issue;
    } catch (error) {
      this.logger.error(`问题创建失败: ${error.message}`);
      throw error;
    }
  }

  @Get(':nodeId/issues')
  async getIssues(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
  ): Promise<Issue[]> {
    this.logger.log('=== 开始获取问题列表 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);

    try {
      const issues = await this.nodeService.getIssues(projectId, +nodeId);
      this.logger.log(`获取到 ${issues.length} 个问题`);
      this.logger.log(`问题列表: ${JSON.stringify(issues, null, 2)}`);
      this.logger.log('=== 问题列表获取完成 ===\n');
      return issues;
    } catch (error) {
      this.logger.error(`获取问题列表失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 问题列表获取异常 ===\n');
      throw error;
    }
  }

  @Patch(':nodeId/issues/:issueId')
  async updateIssue(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Param('issueId') issueId: string,
    @Body() updateIssueDto: {
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

    try {
      const issue = await this.nodeService.updateIssue(
        projectId,
        +nodeId,
        +issueId,
        updateIssueDto
      );
      this.logger.log(`问题更新成功: ${JSON.stringify(issue, null, 2)}`);
      return issue;
    } catch (error) {
      this.logger.error(`更新问题失败: ${error.message}`);
      throw error;
    }
  }

  @Delete(':nodeId/issues/:issueId')
  async deleteIssue(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Param('issueId') issueId: string,
  ): Promise<void> {
    this.logger.log('=== 开始删除问题 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 问题ID: ${issueId}`);

    try {
      await this.nodeService.deleteIssue(projectId, +nodeId, +issueId);
      this.logger.log('问题删除成功');
      this.logger.log('=== 问题删除完成 ===\n');
    } catch (error) {
      this.logger.error(`删除问题失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 问题删除异常 ===\n');
      throw error;
    }
  }

  // 材料相关API
  @Post(':nodeId/materials')
  async createMaterial(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Body() createMaterialDto: CreateMaterialDto,
  ): Promise<Material> {
    this.logger.log('=== 开始创建材料 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);
    this.logger.log(`请求参数: ${JSON.stringify(createMaterialDto, null, 2)}`);

    try {
      if (!createMaterialDto.name) {
        throw new Error('材料名称不能为空');
      }

      if (!createMaterialDto.description) {
        throw new Error('材料描述不能为空');
      }

      const material = await this.nodeService.createMaterial(projectId, +nodeId, createMaterialDto);
      this.logger.log(`材料创建成功: ${JSON.stringify(material, null, 2)}`);
      this.logger.log('=== 材料创建完成 ===\n');
      return material;
    } catch (error) {
      this.logger.error(`材料创建失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 材料创建异常 ===\n');
      throw error;
    }
  }

  @Get(':nodeId/materials')
  async getMaterials(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
  ): Promise<Material[]> {
    this.logger.log('=== 开始获取材料列表 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);

    try {
      const materials = await this.nodeService.getMaterials(projectId, +nodeId);
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

  @Get(':nodeId/materials/:materialId')
  async getMaterial(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Param('materialId') materialId: string,
  ): Promise<Material> {
    this.logger.log('=== 开始获取单个材料 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 材料ID: ${materialId}`);

    try {
      const material = await this.nodeService.getMaterial(projectId, +nodeId, +materialId);
      
      if (!material) {
        throw new Error('材料不存在');
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

  @Patch(':nodeId/materials/:materialId')
  async updateMaterial(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Param('materialId') materialId: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ): Promise<Material> {
    this.logger.log('=== 开始更新材料 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 材料ID: ${materialId}`);
    this.logger.log(`更新数据: ${JSON.stringify(updateMaterialDto, null, 2)}`);

    try {
      const material = await this.nodeService.updateMaterial(
        projectId,
        +nodeId,
        +materialId,
        updateMaterialDto,
      );
      
      this.logger.log(`材料更新成功: ${JSON.stringify(material, null, 2)}`);
      this.logger.log('=== 材料更新完成 ===\n');
      return material;
    } catch (error) {
      this.logger.error(`更新材料失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 材料更新异常 ===\n');
      throw error;
    }
  }

  @Delete(':nodeId/materials/:materialId')
  async deleteMaterial(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Param('materialId') materialId: string,
  ): Promise<void> {
    this.logger.log('=== 开始删除材料 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 材料ID: ${materialId}`);

    try {
      await this.nodeService.deleteMaterial(projectId, +nodeId, +materialId);
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