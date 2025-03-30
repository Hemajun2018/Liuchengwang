import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'liuchengwang_secret_key',
    });
  }

  async validate(payload: any) {
    try {
      // 验证用户是否存在
      const user = await this.usersService.findOne(payload.id);
      
      // 返回用户信息（将被附加到请求对象上）
      return { 
        id: payload.id, 
        username: payload.username, 
        role: payload.role 
      };
    } catch (error) {
      throw new UnauthorizedException('用户不存在或已被删除');
    }
  }
} 