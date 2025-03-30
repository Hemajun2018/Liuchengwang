import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeliverableService } from './deliverable.service';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';

@Controller('projects/:projectId/nodes/:nodeId/deliverables')
export class DeliverableController {
  constructor(private readonly deliverableService: DeliverableService) {}

  @Post()
  create(
    @Param('nodeId') nodeId: string,
    @Body() createDeliverableDto: CreateDeliverableDto
  ) {
    console.log('收到创建交付内容请求:', createDeliverableDto);
    return this.deliverableService.create(+nodeId, createDeliverableDto);
  }

  @Get()
  findAll(@Param('nodeId') nodeId: string) {
    console.log('收到获取节点交付内容列表请求, 节点ID:', nodeId);
    return this.deliverableService.findAll(+nodeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('收到获取单个交付内容请求, ID:', id);
    return this.deliverableService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeliverableDto: UpdateDeliverableDto
  ) {
    console.log('收到更新交付内容请求, ID:', id);
    console.log('更新数据:', updateDeliverableDto);
    return this.deliverableService.update(+id, updateDeliverableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log('收到删除交付内容请求, ID:', id);
    return this.deliverableService.remove(+id);
  }
} 