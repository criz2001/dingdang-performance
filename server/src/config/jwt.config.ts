/**
 * JWT 配置常量
 * 所有值从 .env 读取
 */
export const jwtConfig = () => ({
  secret: process.env.JWT_SECRET || 'dingdang_performance_jwt_secret_2024',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});
