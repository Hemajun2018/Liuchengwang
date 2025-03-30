import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Request, Patch, UnauthorizedException } from '@nestjs/common';
import { ProjectUsersService } from './project-users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('project-users')
export class ProjectUsersController {
  constructor(private readonly projectUsersService: ProjectUsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Get()
  findAll(@Query('projectId') projectId?: string, @Query('userId') userId?: number) {
    return this.projectUsersService.findAll({
      projectId,
      userId: userId ? +userId : undefined,
    });
  }

  // 查询当前用户的项目权限
  @UseGuards(JwtAuthGuard)
  @Get('my-projects')
  async getMyProjects(@Request() req) {
    try {
      // 验证用户信息
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('未找到有效的用户信息');
      }

      // 转换并验证用户ID
      const userId = Number(req.user.id);
      if (isNaN(userId) || userId <= 0) {
        console.error('无效的用户ID:', req.user.id);
        throw new UnauthorizedException('无效的用户ID');
      }

      console.log('开始获取用户项目列表, 用户ID:', userId);

      // 直接查询项目用户关联
      const projectUsers = await this.projectUsersService.findAll({ userId });
      
      // 转换数据格式
      const projects = projectUsers
        .filter(pu => pu.project) // 过滤掉无效的项目数据
        .map(pu => ({
          id: pu.project.id,
          name: pu.project.name,
          status: pu.project.status,
          can_edit: pu.can_edit
        }));

      console.log(`成功获取项目列表, 共 ${projects.length} 个项目`);
      return projects;

    } catch (error) {
      console.error('获取用户项目列表失败:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectUsersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Post()
  create(@Body() createProjectUserDto: { projectId: string; userId: number; can_edit: boolean }) {
    return this.projectUsersService.create(createProjectUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body('can_edit') can_edit: boolean) {
    return this.projectUsersService.update(+id, can_edit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectUsersService.remove(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Delete('project/:projectId/user/:userId')
  removeByProjectAndUser(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.projectUsersService.removeByProjectAndUser(projectId, +userId);
  }
}