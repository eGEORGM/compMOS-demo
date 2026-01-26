/**
 * 表单验证器
 * 提供常用的表单字段验证规则
 */

/**
 * 验证税号（纳税人识别号）
 * 支持15位、18位或20位数字或字母
 * @param {String} taxNumber - 税号
 * @returns {Boolean}
 */
export function validateTaxNumber(taxNumber) {
  if (!taxNumber) return false
  
  // 移除空格
  const cleaned = taxNumber.replace(/\s/g, '')
  
  // 15位、18位或20位数字或字母
  const pattern = /^[A-Z0-9]{15}$|^[A-Z0-9]{18}$|^[A-Z0-9]{20}$/
  return pattern.test(cleaned)
}

/**
 * Element UI表单验证器 - 税号
 */
export const taxNumberValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入纳税人识别号'))
  } else if (!validateTaxNumber(value)) {
    callback(new Error('税号格式不正确，应为15位、18位或20位数字或字母'))
  } else {
    callback()
  }
}

/**
 * 验证手机号
 * @param {String} phone - 手机号
 * @returns {Boolean}
 */
export function validatePhone(phone) {
  if (!phone) return false
  
  // 中国大陆手机号：1开头的11位数字
  const pattern = /^1[3-9]\d{9}$/
  return pattern.test(phone)
}

/**
 * Element UI表单验证器 - 手机号
 */
export const phoneValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!validatePhone(value)) {
    callback(new Error('手机号格式不正确'))
  } else {
    callback()
  }
}

/**
 * 验证邮箱
 * @param {String} email - 邮箱
 * @returns {Boolean}
 */
export function validateEmail(email) {
  if (!email) return false
  
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return pattern.test(email)
}

/**
 * Element UI表单验证器 - 邮箱
 */
export const emailValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!validateEmail(value)) {
    callback(new Error('邮箱格式不正确'))
  } else {
    callback()
  }
}

/**
 * 验证数量（1-99999）
 * @param {Number} quantity - 数量
 * @returns {Boolean}
 */
export function validateQuantity(quantity) {
  if (quantity === null || quantity === undefined) return false
  
  const num = Number(quantity)
  return !isNaN(num) && num >= 1 && num <= 99999 && Number.isInteger(num)
}

/**
 * Element UI表单验证器 - 数量
 */
export const quantityValidator = (rule, value, callback) => {
  if (!value && value !== 0) {
    callback(new Error('请输入数量'))
  } else if (!validateQuantity(value)) {
    callback(new Error('数量必须为1-99999的整数'))
  } else {
    callback()
  }
}

/**
 * 验证金额
 * @param {Number} amount - 金额
 * @param {Object} options - 配置选项
 * @param {Number} options.min - 最小值
 * @param {Number} options.max - 最大值
 * @param {Number} options.decimal - 小数位数
 * @returns {Boolean}
 */
export function validateAmount(amount, options = {}) {
  const { min = 0, max = 999999999.99, decimal = 2 } = options
  
  if (amount === null || amount === undefined) return false
  
  const num = Number(amount)
  if (isNaN(num)) return false
  
  // 检查范围
  if (num < min || num > max) return false
  
  // 检查小数位数
  const parts = num.toString().split('.')
  if (parts[1] && parts[1].length > decimal) return false
  
  return true
}

/**
 * Element UI表单验证器 - 金额
 */
export const amountValidator = (rule, value, callback) => {
  if (!value && value !== 0) {
    callback(new Error('请输入金额'))
  } else if (!validateAmount(value)) {
    callback(new Error('金额格式不正确'))
  } else {
    callback()
  }
}

/**
 * 验证银行账号
 * @param {String} account - 银行账号
 * @returns {Boolean}
 */
export function validateBankAccount(account) {
  if (!account) return false
  
  // 移除空格和横线
  const cleaned = account.replace(/[\s-]/g, '')
  
  // 10-30位数字
  const pattern = /^\d{10,30}$/
  return pattern.test(cleaned)
}

/**
 * Element UI表单验证器 - 银行账号
 */
export const bankAccountValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入银行账号'))
  } else if (!validateBankAccount(value)) {
    callback(new Error('银行账号格式不正确'))
  } else {
    callback()
  }
}

/**
 * 验证地址
 * @param {String} address - 地址
 * @returns {Boolean}
 */
export function validateAddress(address) {
  if (!address) return false
  
  // 长度限制5-200字符
  return address.length >= 5 && address.length <= 200
}

/**
 * Element UI表单验证器 - 地址
 */
export const addressValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入地址'))
  } else if (!validateAddress(value)) {
    callback(new Error('地址长度应为5-200字符'))
  } else {
    callback()
  }
}

/**
 * 验证订单号
 * @param {String} orderNo - 订单号
 * @returns {Boolean}
 */
export function validateOrderNo(orderNo) {
  if (!orderNo) return false
  
  // 订单号格式：字母或数字，8-32位
  const pattern = /^[A-Za-z0-9]{8,32}$/
  return pattern.test(orderNo)
}

/**
 * 验证PDF字段数量（最多20个）
 * @param {Array} fields - 字段数组
 * @returns {Boolean}
 */
export function validatePDFFieldCount(fields) {
  return Array.isArray(fields) && fields.length > 0 && fields.length <= 20
}

/**
 * Element UI表单验证器 - PDF字段数量
 */
export const pdfFieldCountValidator = (rule, value, callback) => {
  if (!value || value.length === 0) {
    callback(new Error('请至少选择一个字段'))
  } else if (value.length > 20) {
    callback(new Error('PDF导出字段最多20个'))
  } else {
    callback()
  }
}

/**
 * 验证时间范围（最多180天）
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {Boolean}
 */
export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) return false
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (start > end) return false
  
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24))
  return diffDays <= 180
}

/**
 * Element UI表单验证器 - 日期范围
 */
export const dateRangeValidator = (rule, value, callback) => {
  if (!value || value.length !== 2) {
    callback(new Error('请选择日期范围'))
  } else if (!validateDateRange(value[0], value[1])) {
    callback(new Error('日期范围不能超过180天'))
  } else {
    callback()
  }
}

/**
 * 通用必填验证
 */
export const requiredValidator = (message = '此项为必填项') => {
  return {
    required: true,
    message,
    trigger: 'blur'
  }
}

/**
 * 通用长度验证
 */
export const lengthValidator = (min, max, message) => {
  return {
    min,
    max,
    message: message || `长度应在${min}-${max}字符之间`,
    trigger: 'blur'
  }
}

