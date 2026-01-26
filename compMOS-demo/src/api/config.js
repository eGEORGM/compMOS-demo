/**
 * 配置相关API
 */

import request from './request'

/**
 * 获取明细设置
 */
export function getDetailSettings() {
  return request({
    url: '/user/configs/detail-settings',
    method: 'get'
  })
}

/**
 * 更新明细设置
 * @param {Object} data - 明细设置数据
 * @param {Boolean} data.enabled - 是否启用
 * @param {Array} data.dimensions - 拆分维度
 * @param {Array} data.hierarchyOrder - 层级顺序
 */
export function updateDetailSettings(data) {
  return request({
    url: '/user/configs/detail-settings',
    method: 'put',
    data
  })
}

/**
 * 获取字段配置
 */
export function getFieldConfig() {
  return request({
    url: '/user/configs/field-config',
    method: 'get'
  })
}

/**
 * 更新字段配置
 * @param {Object} data - 字段配置数据
 * @param {Array} data.display - 显示字段
 * @param {Array} data.excelExport - Excel导出字段
 * @param {Array} data.pdfExport - PDF导出字段（最多20个）
 */
export function updateFieldConfig(data) {
  return request({
    url: '/user/configs/field-config',
    method: 'put',
    data
  })
}

/**
 * 获取系统配置
 */
export function getSystemConfig() {
  return request({
    url: '/system/config',
    method: 'get'
  })
}

