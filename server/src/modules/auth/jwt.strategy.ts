import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../config/jwt.config';

/**
 * JWT 策略
 * 从请求头提取 Bearer Token，验证后注入用户信息到 request.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig().secret,
    });
  }

  /**
   * Token验证通过后，将payload解析为user对象
   */
  async validate(payload: { sub: number; username: string; role: string }) {
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
