/**
 * 统一错误处理器
 * 提供错误码映射、错误日志记录、错误提示等功能
 */

import { Message, MessageBox } from 'element-ui'

/**
 * 业务错误码映射表
 */
const ERROR_CODE_MAP = {
  // 通用错误 1xxx
  1000: '操作失败',
  1001: '参数错误',
  1002: '数据不存在',
  1003: '数据已存在',
  1004: '操作被拒绝',
  1005: '操作超时',
  
  // 账单错误 10xxx
  10001: '账单不存在',
  10002: '账单状态不允许此操作',
  10003: '账单确认失败，请检查订单数据',
  10004: '账单已进入开票流程，无法撤销确认',
  10005: '账单包含未核对订单，无法确认',
  10006: '账单已确认，无法修改',
  10007: '账单尚未确认，无法开票',
  10008: '账单导出失败',
  
  // 开票错误 20xxx
  20001: '开票申请失败',
  20002: '发票抬头信息不完整',
  20003: '开票金额超过可开票金额',
  20004: '发票种类不支持',
  20005: '发票不存在',
  20006: '发票已红冲，无法再次操作',
  20007: '发票下载失败',
  20008: '红冲失败，请联系客服',
  20009: '换开失败，请检查发票抬头信息',
  20010: '发票抬头已存在',
  20011: '发票数量超过限制',
  
  // 订单错误 30xxx
  30001: '订单不存在',
  30002: '订单状态异常',
  30003: '订单已核对，无法修改',
  30004: '订单批量操作失败',
  30005: '订单调账失败',
  
  // 配置错误 40xxx
  40001: '配置保存失败',
  40002: 'PDF字段超过20个限制',
  40003: '明细设置保存失败',
  40004: '字段配置无效',
  40005: '拆分维度重复',
  
  // 权限错误 50xxx
  50001: '无访问权限',
  50002: '操作权限不足',
  50003: '企业未授权',
  50004: '功能未开放',
  
  // 网络错误 90xxx
  90001: '网络连接失败',
  90002: '请求超时',
  90003: '服务不可用',
  90004: '服务器错误'
}

/**
 * HTTP状态码映射表
 */
const HTTP_STATUS_MAP = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求地址不存在',
  408: '请求超时',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时'
}

/**
 * 错误日志级别
 */
const ERROR_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal'
}

/**
 * 获取错误消息
 * @param {Number|String} code - 错误码
 * @param {String} defaultMessage - 默认消息
 * @returns {String}
 */
export function getErrorMessage(code, defaultMessage = '操作失败，请稍后重试') {
  return ERROR_CODE_MAP[code] || HTTP_STATUS_MAP[code] || defaultMessage
}

/**
 * 处理API错误
 * @param {Error} error - 错误对象
 * @param {Object} options - 配置选项
 * @param {Boolean} options.silent - 是否静默（不显示提示）
 * @param {Boolean} options.showConfirm - 显示确认对话框而非Toast
 * @param {String} options.customMessage - 自定义错误消息
 * @param {Function} options.onError - 错误回调
 */
export function handleApiError(error, options = {}) {
  const {
    silent = false,
    showConfirm = false,
    customMessage = null,
    onError = null
  } = options
  
  // 提取错误信息
  const errorInfo = extractErrorInfo(error)
  
  // 记录错误日志
  logError(errorInfo)
  
  // 执行自定义错误回调
  if (onError && typeof onError === 'function') {
    onError(errorInfo)
  }
  
  // 如果静默模式，不显示提示
  if (silent) {
    return errorInfo
  }
  
  // 确定显示的消息
  const message = customMessage || errorInfo.message
  
  // 显示错误提示
  if (showConfirm) {
    MessageBox.alert(message, '错误', {
      type: 'error',
      confirmButtonText: '确定'
    })
  } else {
    Message({
      message,
      type: 'error',
      duration: 5000,
      showClose: true
    })
  }
  
  return errorInfo
}

/**
 * 提取错误信息
 * @param {Error} error - 错误对象
 * @returns {Object}
 */
function extractErrorInfo(error) {
  const info = {
    code: null,
    message: '操作失败，请稍后重试',
    level: ERROR_LEVELS.ERROR,
    details: null,
    timestamp: new Date().toISOString()
  }
  
  // 如果是axios错误响应
  if (error.response) {
    const { status, data } = error.response
    
    info.code = data.code || status
    info.message = getErrorMessage(info.code, data.message)
    info.details = {
      status,
      url: error.config && error.config.url,
      method: error.config && error.config.method,
      data: data
    }
    
    // 根据状态码判断错误级别
    if (status >= 500) {
      info.level = ERROR_LEVELS.FATAL
    } else if (status >= 400) {
      info.level = ERROR_LEVELS.ERROR
    }
  }
  // 如果是axios请求错误
  else if (error.request) {
    info.code = 90001
    info.message = '网络连接失败，请检查网络'
    info.level = ERROR_LEVELS.WARN
    info.details = {
      url: error.config && error.config.url,
      timeout: error.config && error.config.timeout
    }
  }
  // 如果是其他类型错误
  else {
    info.message = error.message || '未知错误'
    info.details = {
      stack: error.stack
    }
  }
  
  return info
}

/**
 * 记录错误日志
 * @param {Object} errorInfo - 错误信息
 */
function logError(errorInfo) {
  const { level, message, code, details, timestamp } = errorInfo
  
  // 构建日志消息
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] Code: ${code}, Message: ${message}`
  
  // 根据级别输出日志
  switch (level) {
    case ERROR_LEVELS.INFO:
      console.info(logMessage, details)
      break
    case ERROR_LEVELS.WARN:
      console.warn(logMessage, details)
      break
    case ERROR_LEVELS.ERROR:
      console.error(logMessage, details)
      break
    case ERROR_LEVELS.FATAL:
      console.error('💥', logMessage, details)
      break
    default:
      console.log(logMessage, details)
  }
  
  // 在生产环境，可以将错误上报到监控系统
  if (process.env.NODE_ENV === 'production') {
    // TODO: 上报到错误监控系统（如Sentry）
    // reportToMonitoring(errorInfo)
  }
}

/**
 * 显示成功提示
 * @param {String} message - 消息内容
 * @param {Number} duration - 显示时长
 */
export function showSuccess(message, duration = 3000) {
  Message({
    message,
    type: 'success',
    duration,
    showClose: true
  })
}

/**
 * 显示警告提示
 * @param {String} message - 消息内容
 * @param {Number} duration - 显示时长
 */
export function showWarning(message, duration = 3000) {
  Message({
    message,
    type: 'warning',
    duration,
    showClose: true
  })
}

/**
 * 显示信息提示
 * @param {String} message - 消息内容
 * @param {Number} duration - 显示时长
 */
export function showInfo(message, duration = 3000) {
  Message({
    message,
    type: 'info',
    duration,
    showClose: true
  })
}

/**
 * 显示确认对话框
 * @param {String} message - 消息内容
 * @param {String} title - 标题
 * @param {Object} options - 配置选项
 * @returns {Promise}
 */
export function showConfirm(message, title = '提示', options = {}) {
  return MessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    ...options
  })
}

/**
 * 错误边界处理（用于Vue组件）
 * @param {Function} fn - 执行函数
 * @param {Object} options - 错误处理选项
 * @returns {Promise}
 */
export async function errorBoundary(fn, options = {}) {
  try {
    return await fn()
  } catch (error) {
    return handleApiError(error, options)
  }
}

/**
 * 批量操作错误处理
 * @param {Array} results - 批量操作结果
 * @param {String} successMessage - 成功消息模板
 * @param {String} errorMessage - 失败消息模板
 */
export function handleBatchOperationResults(results, successMessage, errorMessage) {
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length
  
  if (failCount === 0) {
    showSuccess(successMessage.replace('{count}', successCount))
  } else if (successCount === 0) {
    Message({
      message: errorMessage.replace('{count}', failCount),
      type: 'error',
      duration: 5000,
      showClose: true
    })
  } else {
    Message({
      message: `操作完成：成功${successCount}条，失败${failCount}条`,
      type: 'warning',
      duration: 5000,
      showClose: true
    })
  }
}

export default {
  handleApiError,
  getErrorMessage,
  showSuccess,
  showWarning,
  showInfo,
  showConfirm,
  errorBoundary,
  handleBatchOperationResults,
  ERROR_LEVELS
}

