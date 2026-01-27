// Config Module - 配置管理
import mockApi from '@/mock/index'
import storage from '@/utils/storage'

const state = {
  // 明细设置配置（用于列表页的订单明细展示）
  detailSettings: storage.getDetailSettings() || {
    enabled: false,
    dimensions: [],
    hierarchyOrder: []
  },
  
  // 拆分汇总配置（用于开票页的数据拆分，独立管理）
  splitConfig: storage.getSplitConfig() || {
    dimension1: null,
    dimension2: null,
    dimensions: []
  },
  
  // 字段配置
  fieldConfig: storage.getFieldConfig() || {
    display: [],
    excelExport: [],
    pdfExport: []
  },
  
  // 用户偏好设置
  userPreferences: {
    pageSize: 20,
    theme: 'default',
    language: 'zh-CN'
  },
  
  // 系统配置（从后台获取）
  systemConfig: {
    maxBatchQueryCount: 500,
    maxOrdersPerBill: 10000,
    pdfMaxFields: 20,
    exportTimeout: 60
  },
  
  // UI状态
  loading: false,
  error: null
}

const getters = {
  // 获取明细设置
  detailSettings: state => state.detailSettings,
  
  // 获取字段配置
  fieldConfig: state => state.fieldConfig,
  
  // 获取显示字段
  displayFields: state => state.fieldConfig.display,
  
  // 获取Excel导出字段
  excelExportFields: state => state.fieldConfig.excelExport,
  
  // 获取PDF导出字段
  pdfExportFields: state => state.fieldConfig.pdfExport,
  
  // 获取用户偏好
  userPreferences: state => state.userPreferences,
  
  // 获取系统配置
  systemConfig: state => state.systemConfig,
  
  // 检查PDF字段数量是否超限
  isPdfFieldsOverLimit: state => {
    return state.fieldConfig.pdfExport.length > state.systemConfig.pdfMaxFields
  }
}

const mutations = {
  // 设置明细设置（仅用于列表页订单明细展示）
  SET_DETAIL_SETTINGS(state, settings) {
    state.detailSettings = settings
    storage.setDetailSettings(settings) // 持久化到LocalStorage
  },
  
  // 设置拆分汇总配置（仅用于开票页数据拆分，独立管理）
  SET_SPLIT_CONFIG(state, config) {
    state.splitConfig = config
    storage.setSplitConfig(config) // 持久化到独立的LocalStorage
  },
  
  // 设置字段配置
  SET_FIELD_CONFIG(state, config) {
    state.fieldConfig = config
    storage.setFieldConfig(config) // 持久化到LocalStorage
  },
  
  // 更新显示字段
  UPDATE_DISPLAY_FIELDS(state, fields) {
    state.fieldConfig.display = fields
    storage.setFieldConfig(state.fieldConfig)
  },
  
  // 更新Excel导出字段
  UPDATE_EXCEL_EXPORT_FIELDS(state, fields) {
    state.fieldConfig.excelExport = fields
    storage.setFieldConfig(state.fieldConfig)
  },
  
  // 更新PDF导出字段
  UPDATE_PDF_EXPORT_FIELDS(state, fields) {
    // 限制PDF字段数量
    if (fields.length > state.systemConfig.pdfMaxFields) {
      throw new Error(`PDF导出字段最多${state.systemConfig.pdfMaxFields}个`)
    }
    state.fieldConfig.pdfExport = fields
    storage.setFieldConfig(state.fieldConfig)
  },
  
  // 设置用户偏好
  SET_USER_PREFERENCES(state, preferences) {
    state.userPreferences = { ...state.userPreferences, ...preferences }
  },
  
  // 设置系统配置
  SET_SYSTEM_CONFIG(state, config) {
    state.systemConfig = { ...state.systemConfig, ...config }
  },
  
  // 设置加载状态
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  // 设置错误信息
  SET_ERROR(state, error) {
    state.error = error
  },
  
  // 清除错误信息
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  // 获取明细设置
  async fetchDetailSettings({ commit }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.getDetailSettings()
      commit('SET_DETAIL_SETTINGS', response.data)
      return response
    } catch (error) {
      // 如果API失败，使用LocalStorage的缓存
      console.warn('Failed to fetch detail settings from API, using local cache')
      commit('SET_ERROR', error.message || '获取明细设置失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新明细设置
  async updateDetailSettings({ commit }, settings) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 先更新本地
      commit('SET_DETAIL_SETTINGS', settings)
      
      // 再同步到后端
      const response = await mockApi.updateDetailSettings(settings)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message || '更新明细设置失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取字段配置
  async fetchFieldConfig({ commit }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.getFieldConfig()
      commit('SET_FIELD_CONFIG', response.data)
      return response
    } catch (error) {
      // 如果API失败，使用LocalStorage的缓存
      console.warn('Failed to fetch field config from API, using local cache')
      commit('SET_ERROR', error.message || '获取字段配置失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新字段配置
  async updateFieldConfig({ commit, state }, config) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 验证PDF字段数量
      if (config.pdfExport && config.pdfExport.length > state.systemConfig.pdfMaxFields) {
        throw new Error(`PDF导出字段最多${state.systemConfig.pdfMaxFields}个`)
      }
      
      // 先更新本地
      commit('SET_FIELD_CONFIG', config)
      
      // 再同步到后端
      const response = await mockApi.updateFieldConfig(config)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message || '更新字段配置失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取系统配置
  async fetchSystemConfig({ commit }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.getSystemConfig()
      commit('SET_SYSTEM_CONFIG', response.data)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message || '获取系统配置失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新用户偏好
  updateUserPreferences({ commit }, preferences) {
    commit('SET_USER_PREFERENCES', preferences)
  },
  
  // 重置配置
  resetConfig({ commit }) {
    storage.clearAll()
    commit('SET_DETAIL_SETTINGS', {
      enabled: false,
      dimensions: [],
      hierarchyOrder: []
    })
    commit('SET_FIELD_CONFIG', {
      display: [],
      excelExport: [],
      pdfExport: []
    })
  },
  
  // 保存明细设置（别名方法，用于统一调用）
  saveDetailSettings({ dispatch }, settings) {
    return dispatch('updateDetailSettings', settings)
  },
  
  // 保存拆分汇总配置（独立保存，不影响明细设置）
  async saveSplitConfig({ commit }, config) {
    // 确保 dimensions 数组与 dimension1/dimension2 同步
    const dimensions = [];
    if (config.dimension1) dimensions.push(config.dimension1);
    if (config.dimension2) dimensions.push(config.dimension2);
    
    const fullConfig = {
      ...config,
      dimensions
    };
    
    // 更新本地 splitConfig（独立保存）
    commit('SET_SPLIT_CONFIG', fullConfig)
    
    // 如果需要同步到后端API，可以在这里添加
    // await mockApi.updateSplitConfig(fullConfig)
    
    return Promise.resolve({ success: true, data: fullConfig })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

