/**
 * Axios 实例封装
 * 统一处理请求拦截、响应拦截、错误处理
 */

import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getToken, removeToken } from './storage'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器
 * - 添加 JWT Token
 * - 添加时间戳防止缓存
 */
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }
    return config
  },
  (error: AxiosError) => {
    console.error('【请求拦截器】请求配置错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * - 处理业务错误码
 * - 处理 HTTP 错误
 * - 处理 Token 过期
 */
service.interceptors.response.use(
  (response) => {
    const res = response.data

    // 根据后端响应格式 { code, message, data, timestamp } 处理
    if (res.code !== undefined) {
      if (res.code === 0 || res.code === 200) {
        return res.data
      }
      // 业务错误
      ElMessage.error(res.message || '操作失败')
      return Promise.reject(new Error(res.message || '操作失败'))
    }

    // 非标准格式直接返回
    return res
  },
  (error: AxiosError<{ code?: number; message?: string }>) => {
    // 处理 HTTP 错误
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 401:
          // Token 过期或无效 / 登录凭证错误
          const errMsg = data?.message || '登录已过期，请重新登录'
          ElMessage.error(errMsg)
          removeToken()
          router.push('/login')
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || `请求失败 (${status})`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      // 请求配置出错
      ElMessage.error(error.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

export default service

/**
 * GET 请求
 */
export const get = <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.get(url, { params, ...config })
}

/**
 * POST 请求
 */
export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.post(url, data, config)
}

/**
 * PUT 请求
 */
export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.put(url, data, config)
}

/**
 * DELETE 请求
 */
export const del = <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.delete(url, { params, ...config })
}
