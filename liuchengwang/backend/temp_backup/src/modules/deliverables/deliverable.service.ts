import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deliverable, DeliverableStatus } from '../../database/entities/deliverable.entity';
import { Node } from '../../database/entities/node.entity';

@Injectable()
export class DeliverableService {
  private readonly logger = new Logger(DeliverableService.name);

  constructor(
    @InjectRepository(Deliverable)
    private readonly deliverableRepository: Repository<Deliverable>,
    @InjectRepository(Node)
    private readonly nodeRepository: Repository<Node>
  ) {}

  async findAll(projectId: string, nodeId: number): Promise<Deliverable[]> {
    this.logger.log(`查询节点交付内容列表, 项目ID: ${projectId}, 节点ID: ${nodeId}`);
    
    try {
      // 首先验证节点存在且属于该项目
      const node = await this.nodeRepository.findOne({
        where: { id: nodeId, projectId }
      });
      
      if (!node) {
        this.logger.warn(`节点不存在或不属于该项目, 项目ID: ${projectId}, 节点ID: ${nodeId}`);
        throw new NotFoundException(`节点 #${nodeId} 不存在或不属于该项目`);
      }
      
      const deliverables = await this.deliverableRepository.find({
        where: { node_id: nodeId },
        order: { id: 'ASC' }
      });
      
      // 添加调试日志
      this.logger.debug(`找到 ${deliverables.length} 个交付内容`);
      this.logger.debug(`交付内容列表: ${JSON.stringify(deliverables)}`);
      
      return deliverables;
    } catch (error) {
      this.logger.error(`查询节点交付内容列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  async findOne(projectId: string, nodeId: number, deliverableId: number): Promise<Deliverable> {
    this.logger.log(`查询交付内容, 项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${deliverableId}`);
    
    try {
      // 首先验证节点存在且属于该项目
      const node = await this.nodeRepository.findOne({
        where: { id: nodeId, projectId }
      });
      
      if (!node) {
        this.logger.warn(`节点不存在或不属于该项目, 项目ID: ${projectId}, 节点ID: ${nodeId}`);
        throw new NotFoundException(`节点 #${nodeId} 不存在或不属于该项目`);
      }
      
      const deliverable = await this.deliverableRepository.findOne({
        where: { id: deliverableId, node_id: nodeId }
      });
      
      if (!deliverable) {
        this.logger.warn(`交付内容不存在, ID: ${deliverableId}`);
        throw new NotFoundException(`交付内容 #${deliverableId} 不存在`);
      }
      
      return deliverable;
    } catch (error) {
      this.logger.error(`查询交付内容失败: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  async create(projectId: string, nodeId: number, data: {
    description: string;
    start_date?: string | null;
    expected_end_date?: string | null;
    duration_days?: number | null;
    status?: DeliverableStatus;
  }): Promise<Deliverable> {
    this.logger.log(`创建交付内容, 项目ID: ${projectId}, 节点ID: ${nodeId}`);
    this.logger.log(`创建数据: ${JSON.stringify(data, null, 2)}`);
    
    try {
      // 首先验证节点存在且属于该项目
      const node = await this.nodeRepository.findOne({
        where: { id: nodeId, projectId }
      });
      
      if (!node) {
        this.logger.warn(`节点不存在或不属于该项目, 项目ID: ${projectId}, 节点ID: ${nodeId}`);
        throw new NotFoundException(`节点 #${nodeId} 不存在或不属于该项目`);
      }
      
      // 处理日期和持续天数
      let duration_days = data.duration_days;
      if (data.start_date && data.expected_end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.expected_end_date);
        if (end < start) {
          throw new Error('结束日期不能早于开始日期');
        }
        const diffTime = Math.abs(end.getTime() - start.getTime());
        duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      const deliverable = this.deliverableRepository.create({
        node_id: nodeId,
        description: data.description,
        start_date: data.start_date ? new Date(data.start_date) : null,
        expected_end_date: data.expected_end_date ? new Date(data.expected_end_date) : null,
        duration_days: duration_days,
        status: data.status || DeliverableStatus.NOT_STARTED
      });
      
      const savedDeliverable = await this.deliverableRepository.save(deliverable);
      this.logger.log(`交付内容创建成功: ${JSON.stringify(savedDeliverable, null, 2)}`);
      return savedDeliverable;
    } catch (error) {
      this.logger.error(`创建交付内容失败: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  async update(projectId: string, nodeId: number, deliverableId: number, data: {
    description?: string;
    start_date?: string | null;
    expected_end_date?: string | null;
    duration_days?: number | null;
    status?: DeliverableStatus;
  }): Promise<Deliverable> {
    this.logger.log(`更新交付内容, 项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${deliverableId}`);
    this.logger.log(`更新数据: ${JSON.stringify(data, null, 2)}`);
    
    try {
      // 首先验证交付内容存在
      const deliverable = await this.findOne(projectId, nodeId, deliverableId);
      
      // 更新交付内容字段
      if (data.description !== undefined) deliverable.description = data.description;
      if (data.start_date !== undefined) deliverable.start_date = data.start_date ? new Date(data.start_date) : null;
      if (data.expected_end_date !== undefined) deliverable.expected_end_date = data.expected_end_date ? new Date(data.expected_end_date) : null;
      if (data.status !== undefined) deliverable.status = data.status;
      
      // 处理日期和持续天数
      if (deliverable.start_date && deliverable.expected_end_date) {
        const diffTime = Math.abs(deliverable.expected_end_date.getTime() - deliverable.start_date.getTime());
        deliverable.duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (data.duration_days !== undefined) {
        deliverable.duration_days = data.duration_days;
      }
      
      const updatedDeliverable = await this.deliverableRepository.save(deliverable);
      this.logger.log(`交付内容更新成功: ${JSON.stringify(updatedDeliverable, null, 2)}`);
      return updatedDeliverable;
    } catch (error) {
      this.logger.error(`更新交付内容失败: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  async remove(projectId: string, nodeId: number, deliverableId: number): Promise<void> {
    this.logger.log(`删除交付内容, 项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${deliverableId}`);
    
    try {
      // 首先验证交付内容存在
      const deliverable = await this.findOne(projectId, nodeId, deliverableId);
      
      const deleteResult = await this.deliverableRepository.delete(deliverableId);
      
      if (deleteResult.affected === 0) {
        throw new Error('交付内容删除失败');
      }
      
      this.logger.log('交付内容删除成功');
    } catch (error) {
      this.logger.error(`删除交付内容失败: ${error.message}`, error.stack);
      throw error;
    }
  }
} 