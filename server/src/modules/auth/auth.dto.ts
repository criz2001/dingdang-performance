import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * 登录请求DTO
 */
export class LoginDto {
  @IsString({ message: '用户名必须为字符串' })
  @MinLength(2, { message: '用户名至少2个字符' })
  @MaxLength(50, { message: '用户名最多50个字符' })
  username: string;

  @IsString({ message: '密码必须为字符串' })
  @MinLength(4, { message: '密码至少4个字符' })
  @MaxLength(100, { message: '密码最多100个字符' })
  password: string;
}
