import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deliverable } from '../../database/entities/deliverable.entity';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { differenceInDays } from 'date-fns';

@Injectable()
export class DeliverableService {
  constructor(
    @InjectRepository(Deliverable)
    private deliverableRepository: Repository<Deliverable>,
  ) {}

  async create(nodeId: number, createDeliverableDto: CreateDeliverableDto): Promise<Deliverable> {
    console.log('创建交付内容:', createDeliverableDto);
    
    const deliverable = this.deliverableRepository.create({
      ...createDeliverableDto,
      node_id: nodeId
    });
    
    // 计算天数
    if (createDeliverableDto.start_date && createDeliverableDto.expected_end_date) {
      const startDate = new Date(createDeliverableDto.start_date);
      const endDate = new Date(createDeliverableDto.expected_end_date);
      deliverable.duration_days = differenceInDays(endDate, startDate);
    }
    
    return this.deliverableRepository.save(deliverable);
  }

  async findAll(nodeId: number): Promise<Deliverable[]> {
    console.log('查询节点交付内容列表, 节点ID:', nodeId);
    
    try {
      const deliverables = await this.deliverableRepository.find({
        where: { node_id: nodeId },
        order: { created_at: 'ASC' }
      });
      
      // 添加详细调试日志
      console.log(`找到 ${deliverables.length} 个交付内容`);
      console.log('交付内容列表:', JSON.stringify(deliverables, null, 2));
      console.log('SQL查询条件:', { node_id: nodeId });
      
      // 直接查询数据库，验证数据是否存在
      const count = await this.deliverableRepository.count({
        where: { node_id: nodeId }
      });
      console.log(`数据库中节点ID为 ${nodeId} 的交付内容数量:`, count);
      
      return deliverables;
    } catch (error) {
      console.error(`查询节点交付内容列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<Deliverable> {
    console.log('查询单个交付内容, ID:', id);
    
    const deliverable = await this.deliverableRepository.findOne({
      where: { id }
    });
    
    if (!deliverable) {
      throw new NotFoundException(`交付内容 #${id} 不存在`);
    }
    
    return deliverable;
  }

  async update(id: number, updateDeliverableDto: UpdateDeliverableDto): Promise<Deliverable> {
    console.log('更新交付内容, ID:', id);
    console.log('更新数据:', updateDeliverableDto);
    
    const deliverable = await this.findOne(id);
    
    // 合并更新数据
    Object.assign(deliverable, updateDeliverableDto);
    
    // 重新计算天数
    if (deliverable.start_date && deliverable.expected_end_date) {
      deliverable.duration_days = differenceInDays(
        new Date(deliverable.expected_end_date),
        new Date(deliverable.start_date)
      );
    }
    
    return this.deliverableRepository.save(deliverable);
  }

  async remove(id: number): Promise<void> {
    console.log('删除交付内容, ID:', id);
    
    const deliverable = await this.findOne(id);
    await this.deliverableRepository.remove(deliverable);
  }
} 