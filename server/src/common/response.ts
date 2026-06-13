/**
 * 统一响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * 成功响应工厂
 */
export function success<T>(data: T, message: string = 'success'): ApiResponse<T> {
  return { code: 0, message, data, timestamp: Date.now() };
}

/**
 * 错误响应工厂
 */
export function fail(code: number, message: string, data: any = null): ApiResponse {
  return { code, message, data, timestamp: Date.now() };
}
