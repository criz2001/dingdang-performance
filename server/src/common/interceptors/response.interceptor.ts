import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../response';

/**
 * 统一响应拦截器
 * 将所有的响应包装为 { code: 0, message: 'success', data, timestamp } 格式
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => ({
        code: 0,
        message: 'success',
        data,
        timestamp: Date.now(),
      })),
    );
  }
}
