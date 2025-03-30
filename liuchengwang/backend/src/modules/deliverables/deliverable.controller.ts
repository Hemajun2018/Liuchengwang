import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { DeliverableService } from './deliverable.service';
import { Deliverable, DeliverableStatus } from '../../database/entities/deliverable.entity';

@Controller('projects/:projectId/nodes/:nodeId/deliverables')
export class DeliverableController {
  private readonly logger = new Logger(DeliverableController.name);
  
  constructor(private readonly deliverableService: DeliverableService) {}

  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Body() createDeliverableDto: {
      description: string;
      start_date?: string | null;
      expected_end_date?: string | null;
      duration_days?: number | null;
      status?: DeliverableStatus;
    },
  ): Promise<Deliverable> {
    this.logger.log('=== 开始创建交付内容 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);
    this.logger.log(`请求参数: ${JSON.stringify(createDeliverableDto, null, 2)}`);

    try {
      const deliverable = await this.deliverableService.create(projectId, +nodeId, createDeliverableDto);
      this.logger.log(`交付内容创建成功: ${JSON.stringify(deliverable, null, 2)}`);
      this.logger.log('=== 交付内容创建完成 ===\n');
      return deliverable;
    } catch (error) {
      this.logger.error(`交付内容创建失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 交付内容创建异常 ===\n');
      throw error;
    }
  }

  @Get()
  async findAll(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
  ): Promise<Deliverable[]> {
    this.logger.log('=== 开始获取交付内容列表 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);

    try {
      const deliverables = await this.deliverableService.findAll(projectId, +nodeId);
      this.logger.log(`获取到 ${deliverables.length} 个交付内容`);
      this.logger.log('=== 交付内容列表获取完成 ===\n');
      return deliverables;
    } catch (error) {
      this.logger.error(`获取交付内容列表失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 交付内容列表获取异常 ===\n');
      throw error;
    }
  }

  @Get(':id')
  async findOne(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Param('id') id: string,
  ): Promise<Deliverable> {
    this.logger.log('=== 开始获取单个交付内容 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${id}`);

    try {
      const deliverable = await this.deliverableService.findOne(projectId, +nodeId, +id);
      this.logger.log(`获取到交付内容: ${JSON.stringify(deliverable, null, 2)}`);
      this.logger.log('=== 交付内容获取完成 ===\n');
      return deliverable;
    } catch (error) {
      this.logger.error(`获取交付内容失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 交付内容获取异常 ===\n');
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Param('id') id: string,
    @Body() updateDeliverableDto: {
      description?: string;
      start_date?: string | null;
      expected_end_date?: string | null;
      duration_days?: number | null;
      status?: DeliverableStatus;
    },
  ): Promise<Deliverable> {
    this.logger.log('=== 开始更新交付内容 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${id}`);
    this.logger.log(`更新数据: ${JSON.stringify(updateDeliverableDto, null, 2)}`);

    try {
      const deliverable = await this.deliverableService.update(
        projectId,
        +nodeId,
        +id,
        updateDeliverableDto
      );
      this.logger.log(`交付内容更新成功: ${JSON.stringify(deliverable, null, 2)}`);
      this.logger.log('=== 交付内容更新完成 ===\n');
      return deliverable;
    } catch (error) {
      this.logger.error(`更新交付内容失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 交付内容更新异常 ===\n');
      throw error;
    }
  }

  @Delete(':id')
  async remove(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Param('id') id: string,
  ): Promise<void> {
    this.logger.log('=== 开始删除交付内容 ===');
    this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${id}`);

    try {
      await this.deliverableService.remove(projectId, +nodeId, +id);
      this.logger.log('交付内容删除成功');
      this.logger.log('=== 交付内容删除完成 ===\n');
    } catch (error) {
      this.logger.error(`删除交付内容失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      this.logger.error('=== 交付内容删除异常 ===\n');
      throw error;
    }
  }
} 