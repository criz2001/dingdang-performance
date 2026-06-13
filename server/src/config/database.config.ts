import { config } from 'dotenv';
import { join, resolve } from 'path';

// 加载 .env 文件
const envPath = resolve(__dirname, '../../.env');
config({ path: envPath });

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 数据库配置工厂
 * 根据 DB_TYPE 环境变量自动选择 SQLite 或 MySQL
 */
export function getDatabaseConfig(): TypeOrmModuleOptions {
  const dbType = process.env.DB_TYPE || 'sqlite';

  const baseConfig = {
    entities: [join(__dirname, '../entities/*.entity{.ts,.js}')],
    synchronize: true, // 开发环境自动建表
    logging: process.env.NODE_ENV === 'development',
  };

  if (dbType === 'mysql') {
    return {
      ...baseConfig,
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      username: process.env.MYSQL_USERNAME || 'root',
      password: process.env.MYSQL_PASSWORD || '123456',
      database: process.env.MYSQL_DATABASE || 'dingdang_performance',
    } as TypeOrmModuleOptions;
  }

  // 默认使用 SQLite
  return {
    ...baseConfig,
    type: 'better-sqlite3',
    database: resolve(__dirname, '../../', process.env.SQLITE_PATH || './data/dingdang.db'),
  } as TypeOrmModuleOptions;
}
