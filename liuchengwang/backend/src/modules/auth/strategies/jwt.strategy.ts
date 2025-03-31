import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'liuchengwang_secret_key',
    });
  }

  async validate(payload: any) {
    try {
      // 判断是用户还是项目的token
      if (payload.type === 'project') {
        // 验证项目是否存在
        const project = await this.projectRepository.findOne({
          where: { id: payload.id }
        });
        
        if (!project) {
          throw new UnauthorizedException('项目不存在或已被删除');
        }
        
        // 返回项目信息（将被附加到请求对象上）
        return { 
          id: payload.id, 
          name: payload.name,
          type: 'project'
        };
      } else {
        // 原来的用户验证逻辑
        const user = await this.usersService.findOne(payload.id);
        
        // 返回用户信息（将被附加到请求对象上）
        return { 
          id: payload.id, 
          username: payload.username, 
          role: payload.role 
        };
      }
    } catch (error) {
      throw new UnauthorizedException('认证失败，请重新登录');
    }
  }
} 