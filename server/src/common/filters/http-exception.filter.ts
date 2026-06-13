import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { fail } from '../response';

/**
 * 统一异常过滤器
 * 将所有的异常响应包装为统一格式
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object') {
        const obj = exResponse as Record<string, any>;
        message = obj.message || message;
        // class-validator 的错误信息可能是数组
        if (Array.isArray(message)) {
          message = message.join('; ');
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json(fail(status, message));
  }
}
