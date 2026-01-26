/**
 * Axios请求配置和拦截器
 * 统一处理请求/响应、错误处理、token注入等
 */

import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api',
  timeout: 30000, // 请求超时时间30秒
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加token到请求头
    const token = store.state.user.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 添加企业ID到请求头（如果存在）
    const companyId = store.state.user.userInfo.companyId
    if (companyId) {
      config.headers['X-Company-Id'] = companyId
    }
    
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码为200或success为true，说明接口正常
    if (res.code === 200 || res.success === true) {
      return res
    }
    
    // 业务逻辑错误处理
    handleBusinessError(res)
    return Promise.reject(new Error(res.message || 'Error'))
  },
  error => {
    // HTTP错误处理
    handleHttpError(error)
    return Promise.reject(error)
  }
)

/**
 * 业务错误处理
 * @param {Object} res - 响应数据
 */
function handleBusinessError(res) {
  const errorMap = {
    400: '请求参数错误',
    401: '登录已过期，请重新登录',
    403: '没有权限访问此资源',
    404: '请求的资源不存在',
    500: '服务器错误，请稍后重试',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
    
    // 业务错误码
    10001: '账单不存在',
    10002: '账单状态不允许此操作',
    10003: '账单确认失败，请检查订单数据',
    10004: '账单已进入开票流程，无法撤销确认',
    
    20001: '开票申请失败',
    20002: '发票抬头信息不完整',
    20003: '开票金额超过可开票金额',
    20004: '发票种类不支持',
    
    30001: '订单不存在',
    30002: '订单状态异常',
    
    40001: '配置保存失败',
    40002: 'PDF字段超过20个限制'
  }
  
  const message = errorMap[res.code] || res.message || '操作失败'
  
  Message({
    message,
    type: 'error',
    duration: 5000,
    showClose: true
  })
  
  // 特殊错误处理
  if (res.code === 401) {
    // 登录过期，清除用户信息并跳转登录页
    store.dispatch('user/logout')
    router.push('/login')
  }
}

/**
 * HTTP错误处理
 * @param {Error} error - 错误对象
 */
function handleHttpError(error) {
  let message = '网络错误，请检查网络连接'
  
  if (error.response) {
    // 服务器返回了错误状态码
    const status = error.response.status
    const errorMap = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '拒绝访问',
      404: '请求地址不存在',
      408: '请求超时',
      500: '服务器内部错误',
      501: '服务未实现',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时',
      505: 'HTTP版本不受支持'
    }
    
    message = errorMap[status] || `服务器错误 (${status})`
    
    // 401特殊处理
    if (status === 401) {
      store.dispatch('user/logout')
      router.push('/login')
    }
  } else if (error.request) {
    // 请求已发出但没有收到响应
    if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    } else {
      message = '网络连接失败，请检查网络'
    }
  } else {
    // 请求配置出错
    message = '请求配置错误'
  }
  
  Message({
    message,
    type: 'error',
    duration: 5000,
    showClose: true
  })
}

/**
 * 请求重试机制（可选）
 * @param {Object} config - axios配置
 * @param {Number} retryCount - 重试次数
 */
function retryRequest(config, retryCount = 3) {
  config.__retryCount = config.__retryCount || 0
  
  if (config.__retryCount >= retryCount) {
    return Promise.reject(new Error('请求失败，已达到最大重试次数'))
  }
  
  config.__retryCount++
  
  const backoff = new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, config.__retryCount * 1000)
  })
  
  return backoff.then(() => {
    return service(config)
  })
}

export default service

