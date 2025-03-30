import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, Request, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from '../../database/entities/project.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Post()
  create(@Body() createProjectDto: {
    name: string;
    password: string;
  }, @Request() req) {
    console.log('收到创建项目请求:', createProjectDto);
    return this.projectService.create(createProjectDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: {
    page?: string;
    pageSize?: string;
    keyword?: string;
    status?: string;
  }, @Request() req) {
    console.log('收到获取项目列表请求, 参数:', query);
    return this.projectService.findAll({
      page: query.page ? parseInt(query.page) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
      keyword: query.keyword,
      status: query.status,
      user: req.user
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('收到获取单个项目请求, id:', id);
    return this.projectService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: Partial<Project>) {
    console.log('收到更新项目请求, id:', id);
    console.log('更新数据:', JSON.stringify(updateProjectDto, null, 2));
    
    // 如果包含日期字段,打印格式
    if(updateProjectDto.start_time) {
      console.log('开始时间格式:', updateProjectDto.start_time, typeof updateProjectDto.start_time);
    }
    if(updateProjectDto.end_time) {
      console.log('结束时间格式:', updateProjectDto.end_time, typeof updateProjectDto.end_time);
    }
    
    return this.projectService.update(id, updateProjectDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log('收到删除项目请求, id:', id);
    return this.projectService.remove(id);
  }

  @Post('verify')
  verifyProject(@Body() data: { name: string; password: string }) {
    console.log('收到验证项目密码请求:', data);
    return this.projectService.verifyProject(data.name, data.password);
  }
} 