// Bill Module - 账单管理
import mockApi from '@/mock/index'

const state = {
  // 当前查看的账单
  currentBill: null,
  
  // 账单列表
  billList: [],
  
  // 筛选条件
  filters: {
    dateRange: [], // [startDate, endDate]
    status: null,
    orderNo: ''
  },
  
  // 分页信息
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  },
  
  // UI状态
  loading: false,
  error: null
}

const getters = {
  // 获取当前账单
  currentBill: state => state.currentBill,
  
  // 获取账单列表
  billList: state => state.billList,
  
  // 获取筛选条件
  filters: state => state.filters,
  
  // 获取分页信息
  pagination: state => state.pagination,
  
  // 获取加载状态
  isLoading: state => state.loading,
  
  // 根据账单号查找账单
  getBillByNo: state => billNo => {
    return state.billList.find(bill => bill.billNo === billNo)
  }
}

const mutations = {
  // 设置当前账单
  SET_CURRENT_BILL(state, bill) {
    state.currentBill = bill
  },
  
  // 设置账单列表
  SET_BILL_LIST(state, list) {
    state.billList = list
  },
  
  // 更新账单状态
  UPDATE_BILL_STATUS(state, { billNo, billStatus, confirmTime, confirmBy }) {
    // 更新列表中的账单
    const billInList = state.billList.find(b => b.billNo === billNo)
    if (billInList) {
      billInList.billStatus = billStatus
      if (confirmTime) billInList.confirmTime = confirmTime
      if (confirmBy) billInList.confirmBy = confirmBy
    }
    
    // 更新当前账单
    if (state.currentBill && state.currentBill.billNo === billNo) {
      state.currentBill.billStatus = billStatus
      if (confirmTime) state.currentBill.confirmTime = confirmTime
      if (confirmBy) state.currentBill.confirmBy = confirmBy
    }
  },
  
  // 更新账单金额统计
  UPDATE_BILL_AMOUNTS(state, { billNo, invoicedAmount, pendingInvoiceAmount }) {
    const billInList = state.billList.find(b => b.billNo === billNo)
    if (billInList) {
      if (invoicedAmount !== undefined) billInList.invoicedAmount = invoicedAmount
      if (pendingInvoiceAmount !== undefined) billInList.pendingInvoiceAmount = pendingInvoiceAmount
    }
    
    if (state.currentBill && state.currentBill.billNo === billNo) {
      if (invoicedAmount !== undefined) state.currentBill.invoicedAmount = invoicedAmount
      if (pendingInvoiceAmount !== undefined) state.currentBill.pendingInvoiceAmount = pendingInvoiceAmount
    }
  },
  
  // 设置筛选条件
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },
  
  // 重置筛选条件
  RESET_FILTERS(state) {
    state.filters = {
      dateRange: [],
      status: null,
      orderNo: ''
    }
  },
  
  // 设置分页信息
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
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
  // 获取账单列表
  async fetchBillList({ commit, state }, params = {}) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const requestParams = {
        page: params.page || state.pagination.page,
        pageSize: params.pageSize || state.pagination.pageSize,
        startDate: params.startDate,
        endDate: params.endDate,
        status: params.status
      }
      
      const response = await mockApi.getBillList(requestParams)
      
      commit('SET_BILL_LIST', response.data.list)
      commit('SET_PAGINATION', {
        total: response.data.total,
        page: response.data.page,
        pageSize: response.data.pageSize
      })
      
      return response
    } catch (error) {
      commit('SET_ERROR', error.message || '获取账单列表失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取账单详情
  async fetchBillDetail({ commit }, billNo) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.getBillDetail(billNo)
      commit('SET_CURRENT_BILL', response.data)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message || '获取账单详情失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 确认账单
  async confirmBill({ commit, dispatch }, billNo) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.confirmBill(billNo)
      
      // 更新账单状态
      commit('UPDATE_BILL_STATUS', {
        billNo,
        billStatus: response.data.status,
        confirmTime: response.data.confirmTime
      })
      
      // 刷新当前账单详情
      if (billNo) {
        await dispatch('fetchBillDetail', billNo)
      }
      
      return response
    } catch (error) {
      commit('SET_ERROR', error.message || '确认账单失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 撤销确认
  async cancelConfirm({ commit, dispatch }, billNo) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const response = await mockApi.cancelBillConfirm(billNo)
      
      // 更新账单状态
      commit('UPDATE_BILL_STATUS', {
        billNo,
        billStatus: response.data.status,
        confirmTime: null
      })
      
      // 刷新当前账单详情
      if (billNo) {
        await dispatch('fetchBillDetail', billNo)
      }
      
      return response
    } catch (error) {
      commit('SET_ERROR', error.message || '撤销确认失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新筛选条件
  updateFilters({ commit }, filters) {
    commit('SET_FILTERS', filters)
  },
  
  // 重置筛选条件
  resetFilters({ commit }) {
    commit('RESET_FILTERS')
  },
  
  // 更新分页
  updatePagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

