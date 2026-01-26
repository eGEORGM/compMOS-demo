/**
 * 开票相关API
 */

import request from './request'

/**
 * 获取开票汇总信息
 * @param {String} billNo - 账单号
 */
export function getInvoiceSummary(billNo) {
  return request({
    url: `/bills/${billNo}/invoice-summary`,
    method: 'get'
  })
}

/**
 * 提交开票申请
 * @param {Object} data - 开票数据
 * @param {String} data.billNo - 账单号
 * @param {Array} data.invoiceRows - 开票信息行
 */
export function applyInvoice(data) {
  return request({
    url: '/invoices/apply',
    method: 'post',
    data
  })
}

/**
 * 获取开票申请记录列表
 * @param {String} billNo - 账单号
 */
export function getInvoiceApplications(billNo) {
  return request({
    url: `/bills/${billNo}/invoice-applications`,
    method: 'get'
  })
}

/**
 * 下载发票
 * @param {String} invoiceId - 发票ID
 */
export function downloadInvoice(invoiceId) {
  return request({
    url: `/invoices/${invoiceId}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 红冲发票
 * @param {String} invoiceId - 发票ID
 * @param {String} reason - 红冲原因
 */
export function redFlushInvoice(invoiceId, reason) {
  return request({
    url: `/invoices/${invoiceId}/red-flush`,
    method: 'post',
    data: { reason }
  })
}

/**
 * 换开发票
 * @param {String} invoiceId - 发票ID
 * @param {Object} data - 换开数据
 * @param {String} data.newTitleName - 新发票抬头
 * @param {String} data.newTaxNumber - 新税号
 * @param {String} data.reason - 换开原因
 */
export function reissueInvoice(invoiceId, data) {
  return request({
    url: `/invoices/${invoiceId}/reissue`,
    method: 'post',
    data
  })
}

/**
 * 获取发票抬头列表
 */
export function getInvoiceTitles() {
  return request({
    url: '/invoice-titles',
    method: 'get'
  })
}

/**
 * 新增发票抬头
 * @param {Object} data - 发票抬头数据
 * @param {String} data.titleName - 抬头名称
 * @param {String} data.taxNumber - 纳税人识别号
 * @param {String} data.address - 地址
 * @param {String} data.phone - 电话
 * @param {String} data.bankName - 开户行
 * @param {String} data.bankAccount - 账号
 * @param {Boolean} data.isDefault - 是否默认
 */
export function createInvoiceTitle(data) {
  return request({
    url: '/invoice-titles',
    method: 'post',
    data
  })
}

/**
 * 更新发票抬头
 * @param {String} titleId - 抬头ID
 * @param {Object} data - 更新数据
 */
export function updateInvoiceTitle(titleId, data) {
  return request({
    url: `/invoice-titles/${titleId}`,
    method: 'put',
    data
  })
}

/**
 * 删除发票抬头
 * @param {String} titleId - 抬头ID
 */
export function deleteInvoiceTitle(titleId) {
  return request({
    url: `/invoice-titles/${titleId}`,
    method: 'delete'
  })
}

