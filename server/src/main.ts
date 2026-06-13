import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as express from 'express';

// 优先加载 .env 文件
config({ path: resolve(__dirname, '../.env') });

/**
 * 叮当绩效 - 体验版后端服务入口
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 静态文件托管（同端口托管前端，避免跨域）
  const frontendDist = resolve(__dirname, '..', '..', 'web', 'dist');
  app.use(express.static(frontendDist, { index: false }));
  // SPA fallback：非 API、非静态文件请求返回 index.html
  app.use((req: any, res: any, next: any) => {
    if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
      res.sendFile(resolve(frontendDist, 'index.html'), (err: any) => {
        if (err) next();
      });
    } else {
      next();
    }
  });

  // 全局前缀
  const prefix = process.env.APP_PREFIX || '/api';
  app.setGlobalPrefix(prefix);

  // 跨域配置（体验版允许所有来源）
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // 全局管道 - DTO 校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // 自动去除不在DTO中的字段
      forbidNonWhitelisted: false,
      transform: true,           // 自动类型转换
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // 全局拦截器 - 统一响应格式
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局异常过滤器 - 统一异常格式
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 叮当绩效服务已启动: http://localhost:${port}${prefix}`);
  console.log(`📊 数据库类型: ${process.env.DB_TYPE || 'sqlite'}`);
}

bootstrap().catch(err => {
  console.error('❌ 服务启动失败:', err);
  process.exit(1);
});
