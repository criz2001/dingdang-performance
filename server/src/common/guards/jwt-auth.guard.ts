import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 认证守卫
 * 验证请求头中的 Bearer Token，自动解析用户信息到 request.user
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any): any {
    if (err || !user) {
      throw err || new UnauthorizedException('未登录或Token已过期');
    }
    return user;
  }
}
