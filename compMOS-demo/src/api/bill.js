/**
 * 账单相关API
 */

import request from './request'

/**
 * 获取账单列表
 * @param {Object} params - 查询参数
 * @param {String} params.startDate - 开始日期
 * @param {String} params.endDate - 结束日期
 * @param {Number} params.status - 账单状态
 * @param {Number} params.page - 页码
 * @param {Number} params.pageSize - 每页数量
 */
export function getBillList(params) {
  return request({
    url: '/bills',
    method: 'get',
    params
  })
}

/**
 * 获取账单详情
 * @param {String} billNo - 账单号
 */
export function getBillDetail(billNo) {
  return request({
    url: `/bills/${billNo}`,
    method: 'get'
  })
}

/**
 * 确认账单
 * @param {String} billNo - 账单号
 */
export function confirmBill(billNo) {
  return request({
    url: `/bills/${billNo}/confirm`,
    method: 'post',
    data: { billNo }
  })
}

/**
 * 撤销账单确认
 * @param {String} billNo - 账单号
 * @param {String} reason - 撤销原因（可选）
 */
export function cancelBillConfirm(billNo, reason) {
  return request({
    url: `/bills/${billNo}/cancel-confirm`,
    method: 'post',
    data: { billNo, reason }
  })
}

/**
 * 获取账单订单列表
 * @param {String} billNo - 账单号
 * @param {Object} params - 查询参数
 * @param {String} params.businessType - 业务类型
 * @param {Number} params.checkStatus - 核对状态
 * @param {String} params.travelerName - 出行人姓名
 * @param {String} params.legalEntity - 法人实体
 * @param {String} params.orderNos - 订单号列表（逗号分隔）
 * @param {Number} params.page - 页码
 * @param {Number} params.pageSize - 每页数量
 */
export function getBillOrders(billNo, params) {
  return request({
    url: `/bills/${billNo}/orders`,
    method: 'get',
    params
  })
}

/**
 * 批量更新订单
 * @param {String} billNo - 账单号
 * @param {Array} orders - 订单数据
 */
export function batchUpdateOrders(billNo, orders) {
  return request({
    url: `/bills/${billNo}/orders/batch`,
    method: 'put',
    data: { orders }
  })
}

/**
 * 调整订单数据
 * @param {String} billNo - 账单号
 * @param {String} orderNo - 订单号
 * @param {Object} data - 调整数据
 */
export function adjustOrder(billNo, orderNo, data) {
  return request({
    url: `/bills/${billNo}/orders/${orderNo}/adjust`,
    method: 'put',
    data
  })
}

/**
 * 导出账单Excel
 * @param {String} billNo - 账单号
 * @param {Array} fields - 导出字段
 * @param {Object} filters - 筛选条件
 */
export function exportBillExcel(billNo, fields, filters = {}) {
  return request({
    url: `/bills/${billNo}/export/excel`,
    method: 'post',
    data: { fields, filters },
    responseType: 'blob' // 重要：指定响应类型为blob
  })
}

/**
 * 导出账单PDF
 * @param {String} billNo - 账单号
 * @param {Array} fields - 导出字段（最多20个）
 * @param {Object} filters - 筛选条件
 */
export function exportBillPDF(billNo, fields, filters = {}) {
  return request({
    url: `/bills/${billNo}/export/pdf`,
    method: 'post',
    data: { fields, filters },
    responseType: 'blob' // 重要：指定响应类型为blob
  })
}

