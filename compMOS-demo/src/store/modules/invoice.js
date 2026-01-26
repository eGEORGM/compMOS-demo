// Invoice Module - 开票管理
import mockApi from '@/mock/index'

const state = {
  // 开票汇总信息
  invoiceSummary: {
    shouldInvoiceAmount: 0,
    invoicedAmount: 0,
    remainingAmount: 0,
    invoiceDetails: []
  },
  
  // 发票抬头列表
  invoiceTitles: [],
  
  // 开票申请记录列表
  applicationList: [],
  
  // 发票列表
  invoiceList: [],
  
  // 当前开票表单数据
  invoiceForm: {
    invoiceRows: []
  },
  
  // 拆分汇总配置
  splitConfig: {
    enabled: false,
    dimension1: null,
    dimension2: null
  },
  
  // UI状态
  loading: false,
  submitting: false,
  error: null
}

const getters = {
  // 获取开票汇总
  invoiceSummary: state => state.invoiceSummary,
  
  // 获取发票抬头列表
  invoiceTitles: state => state.invoiceTitles,
  
  // 获取默认发票抬头
  defaultInvoiceTitle: state => {
    return state.invoiceTitles.find(title => title.isDefault)
  },
  
  // 获取开票申请记录
  applicationList: state => state.applicationList,
  
  // 获取开票表单
  invoiceForm: state => state.invoiceForm,
  
  // 获取拆分配置
  splitConfig: state => state.splitConfig,
  
  // 计算开票信息行数
  invoiceRowCount: state => state.invoiceForm.invoiceRows.length,
  
  // 计算开票总金额
  totalInvoiceAmount: state => {
    return state.invoiceForm.invoiceRows.reduce((sum, row) => sum + row.amount, 0)
  }
}

const mutations = {
  // 设置开票汇总
  SET_INVOICE_SUMMARY(state, summary) {
    state.invoiceSummary = summary
  },
  
  // 更新开票金额统计
  UPDATE_INVOICE_AMOUNTS(state, { invoicedAmount, remainingAmount }) {
    if (invoicedAmount !== undefined) {
      state.invoiceSummary.invoicedAmount = invoicedAmount
    }
    if (remainingAmount !== undefined) {
      state.invoiceSummary.remainingAmount = remainingAmount
    }
  },
  
  // 设置发票抬头列表
  SET_INVOICE_TITLES(state, titles) {
    state.invoiceTitles = titles
  },
  
  // 添加发票抬头
  ADD_INVOICE_TITLE(state, title) {
    state.invoiceTitles.push(title)
  },
  
  // 设置开票申请记录
  SET_INVOICE_APPLICATIONS(state, applications) {
    state.applicationList = applications
  },
  
  // 添加开票申请记录
  ADD_INVOICE_APPLICATION(state, application) {
    state.applicationList.unshift(application) // 最新的放在前面
  },
  
  // 设置发票列表
  SET_INVOICE_LIST(state, invoices) {
    state.invoiceList = invoices
  },
  
  // 设置开票表单
  SET_INVOICE_FORM(state, form) {
    state.invoiceForm = form
  },
  
  // 更新开票行
  UPDATE_INVOICE_ROW(state, { index, row }) {
    if (index >= 0 && index < state.invoiceForm.invoiceRows.length) {
      state.invoiceForm.invoiceRows.splice(index, 1, row)
    }
  },
  
  // 添加开票行
  ADD_INVOICE_ROW(state, row) {
    state.invoiceForm.invoiceRows.push(row)
  },
  
  // 删除开票行
  REMOVE_INVOICE_ROW(state, index) {
    state.invoiceForm.invoiceRows.splice(index, 1)
  },
  
  // 设置拆分配置
  SET_SPLIT_CONFIG(state, config) {
    state.splitConfig = { ...state.splitConfig, ...config }
  },
  
  // 设置加载状态
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  // 设置提交状态
  SET_SUBMITTING(state, submitting) {
    state.submitting = submitting
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
  // 获取开票汇总
  async fetchInvoiceSummary({ commit }, billNo) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.getInvoiceSummary(billNo)
      commit('SET_INVOICE_SUMMARY', response.data)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取发票抬头列表
  async fetchInvoiceTitles({ commit }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.getInvoiceTitles()
      commit('SET_INVOICE_TITLES', response.data.list)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 新增发票抬头
  async createInvoiceTitle({ commit }, titleData) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.createInvoiceTitle(titleData)
      commit('ADD_INVOICE_TITLE', { ...titleData, id: response.data.id })
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取开票申请记录
  async fetchInvoiceApplications({ commit }, billNo) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.getInvoiceApplications(billNo)
      commit('SET_INVOICE_APPLICATIONS', response.data.list)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取发票列表
  async fetchInvoiceList({ commit }, billNo) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.getInvoiceList(billNo)
      commit('SET_INVOICE_LIST', response.data.list)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 提交开票申请
  async submitInvoiceApplication({ commit, dispatch, rootState }, { billNo, invoiceRows }) {
    commit('SET_SUBMITTING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.applyInvoice({
        billNo,
        invoiceRows
      })
      
      // 更新账单状态为开票中
      await dispatch('bill/fetchBillDetail', billNo, { root: true })
      
      // 刷新开票汇总
      await dispatch('fetchInvoiceSummary', billNo)
      
      // 添加申请记录
      commit('ADD_INVOICE_APPLICATION', {
        id: response.data.applicationId,
        billNo,
        applyTime: response.data.applyTime,
        invoiceCount: response.data.invoiceCount,
        status: 'processing'
      })
      
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },
  
  // 下载发票
  async downloadInvoice({ commit }, invoiceId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.downloadInvoice(invoiceId)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 红冲发票
  async redFlushInvoice({ commit, dispatch }, { invoiceId, reason, billNo }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.redFlushInvoice(invoiceId, reason)
      
      // 刷新开票申请记录
      if (billNo) {
        await dispatch('fetchInvoiceApplications', billNo)
        await dispatch('fetchInvoiceSummary', billNo)
      }
      
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 换开发票
  async reissueInvoice({ commit, dispatch }, { invoiceId, newTitleName, newTaxNumber, reason, billNo }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.reissueInvoice(invoiceId, {
        newTitleName,
        newTaxNumber,
        reason
      })
      
      // 刷新开票申请记录
      if (billNo) {
        await dispatch('fetchInvoiceApplications', billNo)
      }
      
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 初始化开票表单
  initInvoiceForm({ commit }, invoiceDetails) {
    const invoiceRows = invoiceDetails.map(detail => ({
      invoiceType: detail.invoiceType,
      invoiceSummary: detail.invoiceSummary,
      amount: detail.remainingAmount,
      titleId: '',
      receiverName: '',
      receiverPhone: '',
      receiverEmail: '',
      receiverAddress: '',
      unit: '元',
      quantity: 1,
      orderCount: detail.orderCount
    }))
    
    commit('SET_INVOICE_FORM', { invoiceRows })
  },
  
  // 更新开票行
  updateInvoiceRow({ commit }, { index, row }) {
    commit('UPDATE_INVOICE_ROW', { index, row })
  },
  
  // 更新拆分配置
  updateSplitConfig({ commit }, config) {
    commit('SET_SPLIT_CONFIG', config)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

