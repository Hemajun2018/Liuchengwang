import { Controller, Post, Body, Get, Param, UseGuards, Request, Query, Patch, Delete, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('keyword') keyword = '',
    @Query('role') role = '',
  ) {
    return this.usersService.findAll({
      page: +page,
      pageSize: +pageSize,
      keyword,
      role,
    });
  }

  // 用户搜索API，返回用户列表，主要用于项目用户管理
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Get('search')
  async searchUsers(@Query('query') query = '', @Request() req) {
    const currentUserRole = req.user.role;
    
    // 构建角色过滤条件
    let allowedRoles: UserRole[] = [];
    if (currentUserRole === UserRole.SUPER_ADMIN) {
      // 超级管理员可以看到所有角色
      allowedRoles = [
        UserRole.SUPER_ADMIN,
        UserRole.PROJECT_ADMIN,
        UserRole.CONTENT_ADMIN,
        UserRole.EMPLOYEE
      ];
    } else if (currentUserRole === UserRole.PROJECT_ADMIN) {
      // 项目管理员只能看到比自己级别低的角色
      allowedRoles = [
        UserRole.CONTENT_ADMIN,
        UserRole.EMPLOYEE
      ];
    }
    
    try {
      const result = await this.usersService.findAll({
        page: 1,
        pageSize: 50,
        keyword: query,
        roles: allowedRoles // 确保正确传递roles参数
      });
      
      return result.items.map(user => ({
        id: user.id,
        username: user.username,
        realname: user.realName,
        role: user.role,
        email: user.email,
        phone: user.phone
      }));
    } catch (error) {
      console.error('搜索用户失败:', error);
      throw error;
    }
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.id);
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req,
  ) {
    // 只允许用户修改自己的密码，除非是超级管理员
    if (+id !== req.user.id && req.user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('您没有权限修改其他用户的密码');
    }
    return this.usersService.updatePassword(+id, updatePasswordDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    return this.usersService.updateRole(+id, role);
  }
  
  // 初始化超级管理员账户（此API可以被直接调用，用于系统初始化）
  @Post('init-super-admin')
  async initSuperAdmin() {
    await this.usersService.initSuperAdmin();
    return { message: '超级管理员账户初始化成功' };
  }

  // 创建测试用户（仅用于开发环境）
  @Post('create-test-users')
  async createTestUsers() {
    await this.usersService.createTestUsers();
    return { message: '测试用户创建成功' };
  }
}