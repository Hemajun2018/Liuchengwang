import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prerequisite } from '../../database/entities/prerequisite.entity';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';
import { differenceInDays } from 'date-fns';

@Injectable()
export class PrerequisiteService {
  constructor(
    @InjectRepository(Prerequisite)
    private prerequisiteRepository: Repository<Prerequisite>,
  ) {}

  async create(createPrerequisiteDto: CreatePrerequisiteDto): Promise<Prerequisite> {
    console.log('创建前置条件:', createPrerequisiteDto);
    
    const prerequisite = this.prerequisiteRepository.create(createPrerequisiteDto);
    
    // 计算天数
    if (createPrerequisiteDto.start_date && createPrerequisiteDto.expected_end_date) {
      const startDate = new Date(createPrerequisiteDto.start_date);
      const endDate = new Date(createPrerequisiteDto.expected_end_date);
      prerequisite.duration_days = differenceInDays(endDate, startDate);
    }
    
    return this.prerequisiteRepository.save(prerequisite);
  }

  async findAll(projectId: string): Promise<Prerequisite[]> {
    console.log('查询项目前置条件列表, 项目ID:', projectId);
    
    return this.prerequisiteRepository.find({
      where: { project_id: projectId },
      order: { created_at: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Prerequisite> {
    console.log('查询单个前置条件, ID:', id);
    
    const prerequisite = await this.prerequisiteRepository.findOne({
      where: { id }
    });
    
    if (!prerequisite) {
      throw new NotFoundException(`前置条件 #${id} 不存在`);
    }
    
    return prerequisite;
  }

  async update(id: number, updateData: Partial<Prerequisite>): Promise<Prerequisite> {
    console.log('更新前置条件, ID:', id);
    console.log('更新数据:', updateData);
    
    const prerequisite = await this.findOne(id);
    
    // 合并更新数据
    Object.assign(prerequisite, updateData);
    
    // 重新计算天数
    if (prerequisite.start_date && prerequisite.expected_end_date) {
      prerequisite.duration_days = differenceInDays(
        new Date(prerequisite.expected_end_date),
        new Date(prerequisite.start_date)
      );
    }
    
    return this.prerequisiteRepository.save(prerequisite);
  }

  async remove(id: number): Promise<void> {
    console.log('删除前置条件, ID:', id);
    
    const prerequisite = await this.findOne(id);
    await this.prerequisiteRepository.remove(prerequisite);
  }
} 