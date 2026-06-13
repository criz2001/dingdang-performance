import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

const FRONTEND_DIST = join(__dirname, '..', '..', 'web', 'dist');

@Controller()
export class FrontendController {
  @Get('*')
  serveFrontend(@Res() res: Response) {
    const url = res.req.url.split('?')[0];
    // 尝试发送静态文件
    const filePath = join(FRONTEND_DIST, url === '/' ? 'index.html' : url);
    if (existsSync(filePath) && !url.includes('..')) {
      const content = readFileSync(filePath);
      const ext = filePath.split('.').pop().toLowerCase();
      const mimeTypes: Record<string, string> = {
        'html': 'text/html; charset=utf-8',
        'js': 'application/javascript; charset=utf-8',
        'css': 'text/css',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
      };
      res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
      return res.send(content);
    }
    // SPA fallback：返回 index.html
    const index = join(FRONTEND_DIST, 'index.html');
    if (existsSync(index)) {
      return res.send(readFileSync(index).toString());
    }
    return res.status(404).send('404 Not Found');
  }
}
