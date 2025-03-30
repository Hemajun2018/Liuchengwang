import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrerequisiteService } from './prerequisite.service';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';
import { Prerequisite } from '../../database/entities/prerequisite.entity';

@Controller('prerequisites')
export class PrerequisiteController {
  constructor(private readonly prerequisiteService: PrerequisiteService) {}

  @Post()
  create(@Body() createPrerequisiteDto: CreatePrerequisiteDto) {
    console.log('收到创建前置条件请求:', createPrerequisiteDto);
    return this.prerequisiteService.create(createPrerequisiteDto);
  }

  @Get('project/:projectId')
  findAll(@Param('projectId') projectId: string) {
    console.log('收到获取项目前置条件列表请求, 项目ID:', projectId);
    return this.prerequisiteService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('收到获取单个前置条件请求, ID:', id);
    return this.prerequisiteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Prerequisite>) {
    console.log('收到更新前置条件请求, ID:', id);
    console.log('更新数据:', updateData);
    return this.prerequisiteService.update(+id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log('收到删除前置条件请求, ID:', id);
    return this.prerequisiteService.remove(+id);
  }
} 