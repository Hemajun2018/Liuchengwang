import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest(err, user, info) {
    // 如果有错误或者没有用户，抛出未授权异常
    if (err || !user) {
      throw new UnauthorizedException('认证失败，请重新登录');
    }
    return user;
  }
} 