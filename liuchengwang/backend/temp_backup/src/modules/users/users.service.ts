import { Injectable, ConflictException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 创建新用户
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user: Partial<User> }> {
    console.log('开始登录验证:', {
      username: loginDto.username,
      password: loginDto.password
    });

    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    });

    if (!user) {
      console.log('用户不存在:', loginDto.username);
      throw new UnauthorizedException('用户名或密码不正确');
    }

    console.log('找到用户:', {
      username: user.username,
      storedHash: user.password
    });

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    console.log('密码验证结果:', {
      inputPassword: loginDto.password,
      storedHash: user.password,
      isValid: isPasswordValid
    });

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码不正确');
    }

    // 生成JWT令牌
    const payload = { 
      id: user.id,
      username: user.username,
      role: user.role 
    };
    
    const token = this.jwtService.sign(payload);
    console.log('登录成功，生成token');

    // 返回令牌和用户信息（不包含密码）
    const { password, ...result } = user;
    return {
      token,
      user: result,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  async findAll(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    role?: string;
    roles?: UserRole[];
  }) {
    const { page, pageSize, keyword, role, roles } = params;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (keyword) {
      queryBuilder.where(
        '(user.username LIKE :keyword OR user.realName LIKE :keyword OR user.email LIKE :keyword OR user.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 单一角色过滤（向后兼容）
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // 多角色过滤
    if (roles && roles.length > 0) {
      queryBuilder.andWhere('user.role IN (:...roles)', { roles });
    }

    const [items, total] = await queryBuilder
      .orderBy('user.role', 'ASC')
      .addOrderBy('user.username', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: items.map(item => {
        const { password, ...rest } = item;
        return rest;
      }),
      total,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // 更新用户信息
    Object.assign(user, updateUserDto);
    
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    
    // 防止删除最后一个超级管理员
    if (user.role === UserRole.SUPER_ADMIN) {
      const superAdminCount = await this.userRepository.count({
        where: { role: UserRole.SUPER_ADMIN }
      });
      
      if (superAdminCount <= 1) {
        throw new ForbiddenException('系统必须保留至少一个超级管理员账户');
      }
    }
    
    await this.userRepository.remove(user);
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const { oldPassword, newPassword } = updatePasswordDto;
    const user = await this.findOne(id);
    
    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('旧密码不正确');
    }
    
    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    await this.userRepository.save(user);
  }

  async updateRole(id: number, role: UserRole): Promise<User> {
    const user = await this.findOne(id);
    
    // 如果是降级超级管理员，需要检查是否还有其他超级管理员
    if (user.role === UserRole.SUPER_ADMIN && role !== UserRole.SUPER_ADMIN) {
      const superAdminCount = await this.userRepository.count({
        where: { role: UserRole.SUPER_ADMIN }
      });
      
      if (superAdminCount <= 1) {
        throw new ForbiddenException('系统必须保留至少一个超级管理员账户');
      }
    }
    
    // 更新角色
    user.role = role;
    
    return this.userRepository.save(user);
  }

  // 初始化超级管理员账户
  async initSuperAdmin(): Promise<void> {
    const existingSuperAdmin = await this.userRepository.findOne({
      where: { role: UserRole.SUPER_ADMIN }
    });
    
    // 如果已经存在超级管理员，则不需要初始化
    if (existingSuperAdmin) {
      return;
    }
    
    // 查找是否有旧版本的 admin 角色用户
    try {
      // 使用原生SQL查询兼容旧版本的admin角色
      const adminUsers = await this.userRepository.manager.query(
        `SELECT * FROM \`user\` WHERE role = 'admin' LIMIT 1`
      );
      
      if (adminUsers && adminUsers.length > 0) {
        const adminUser = adminUsers[0];
        // 将admin用户升级为超级管理员
        await this.userRepository.manager.query(
          `UPDATE \`user\` SET role = ? WHERE id = ?`,
          [UserRole.SUPER_ADMIN, adminUser.id]
        );
        return;
      }
    } catch (error) {
      console.error('查询 admin 用户失败:', error);
      // 错误处理，继续创建超级管理员
    }
    
    // 创建默认超级管理员账户
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = this.userRepository.create({
      username: 'superadmin',
      password: hashedPassword,
      realName: '超级管理员',
      role: UserRole.SUPER_ADMIN
    });
    
    await this.userRepository.save(superAdmin);
  }

  // 创建测试用户，用于测试不同角色功能
  async createTestUsers(): Promise<void> {
    const existingAdmin = await this.userRepository.findOne({
      where: { username: 'superadmin' }
    });
    
    if (existingAdmin) {
      // 确保超级管理员的角色正确
      existingAdmin.role = UserRole.SUPER_ADMIN;
      await this.userRepository.save(existingAdmin);
    } else {
      // 创建超级管理员
      await this.create({
        username: 'superadmin',
        password: 'admin123',
        realName: '超级管理员',
        role: UserRole.SUPER_ADMIN
      });
    }
    
    // 创建项目管理员
    const existingProjectAdmin = await this.userRepository.findOne({
      where: { username: 'projectadmin' }
    });
    
    if (!existingProjectAdmin) {
      await this.create({
        username: 'projectadmin',
        password: 'admin123',
        realName: '项目管理员',
        role: UserRole.PROJECT_ADMIN
      });
    }
    
    // 创建内容管理员
    const existingContentAdmin = await this.userRepository.findOne({
      where: { username: 'contentadmin' }
    });
    
    if (!existingContentAdmin) {
      await this.create({
        username: 'contentadmin',
        password: 'admin123',
        realName: '内容管理员',
        role: UserRole.CONTENT_ADMIN
      });
    }
    
    // 创建普通用户
    const existingEmployee = await this.userRepository.findOne({
      where: { username: 'employee' }
    });
    
    if (!existingEmployee) {
      await this.create({
        username: 'employee',
        password: 'admin123',
        realName: '普通用户',
        role: UserRole.EMPLOYEE
      });
    }
    
    return;
  }
} 