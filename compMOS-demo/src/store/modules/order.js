// Order Module - 订单管理
import mockApi from '@/mock/index'

const state = {
  // 当前账单的订单列表
  orderList: [],
  
  // 筛选后的订单列表
  filteredOrders: [],
  
  // 搜索条件
  searchFilters: {
    orderNo: '',
    checkStatus: null,
    travelerName: '',
    legalEntity: '',
    businessType: '' // 业务类型筛选
  },
  
  // 批量查询的订单号列表
  batchQueryOrderNos: [],
  
  // 选中的订单（用于批量操作）
  selectedOrders: [],
  
  // 分页信息
  pagination: {
    currentPage: 1,
    pageSize: 100,
    total: 0
  },
  
  // UI状态
  loading: false,
  error: null
}

const getters = {
  // 获取订单列表
  orderList: state => state.orderList,
  
  // 获取筛选后的订单
  filteredOrders: state => state.filteredOrders,
  
  // 获取搜索条件
  searchFilters: state => state.searchFilters,
  
  // 获取选中的订单
  selectedOrders: state => state.selectedOrders,
  
  // 获取分页信息
  pagination: state => state.pagination,
  
  // 根据业务类型筛选订单
  getOrdersByBusinessType: state => businessType => {
    return state.orderList.filter(order => order.businessType === businessType)
  },
  
  // 获取订单统计
  orderSummary: state => {
    const totalAmount = state.filteredOrders.reduce((sum, order) => sum + order.payAmount, 0)
    const totalCount = state.filteredOrders.length
    
    return {
      totalAmount,
      totalCount,
      averageAmount: totalCount > 0 ? totalAmount / totalCount : 0
    }
  },
  
  // 按业务类型统计订单
  orderStatsByBusiness: state => {
    const stats = {}
    state.orderList.forEach(order => {
      const type = order.businessType
      if (!stats[type]) {
        stats[type] = {
          count: 0,
          amount: 0
        }
      }
      stats[type].count++
      stats[type].amount += order.payAmount
    })
    return stats
  }
}

const mutations = {
  // 设置订单列表
  SET_ORDER_LIST(state, list) {
    state.orderList = list
    state.filteredOrders = list // 默认显示全部
  },
  
  // 设置筛选后的订单列表
  SET_FILTERED_ORDERS(state, list) {
    state.filteredOrders = list
  },
  
  // 更新订单状态（批量）
  UPDATE_ORDERS_STATUS(state, { billNo, checkStatus }) {
    state.orderList.forEach(order => {
      if (order.billNo === billNo) {
        order.checkStatus = checkStatus
      }
    })
    
    // 同步更新筛选列表
    state.filteredOrders.forEach(order => {
      if (order.billNo === billNo) {
        order.checkStatus = checkStatus
      }
    })
  },
  
  // 设置搜索条件
  SET_SEARCH_FILTERS(state, filters) {
    state.searchFilters = { ...state.searchFilters, ...filters }
  },
  
  // 重置搜索条件
  RESET_SEARCH_FILTERS(state) {
    state.searchFilters = {
      orderNo: '',
      checkStatus: null,
      travelerName: '',
      legalEntity: '',
      businessType: ''
    }
  },
  
  // 设置批量查询订单号
  SET_BATCH_QUERY_ORDER_NOS(state, orderNos) {
    state.batchQueryOrderNos = orderNos
  },
  
  // 设置选中的订单
  SET_SELECTED_ORDERS(state, orders) {
    state.selectedOrders = orders
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
  // 获取账单订单列表
  async fetchOrderList({ commit, state }, billNo) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const params = {
        ...state.searchFilters,
        page: state.pagination.currentPage,
        pageSize: state.pagination.pageSize
      }
      
      const response = await mockApi.getBillOrders(billNo, params)
      
      commit('SET_ORDER_LIST', response.data.list)
      commit('SET_PAGINATION', {
        total: response.data.total,
        currentPage: response.data.page,
        pageSize: response.data.pageSize
      })
      
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 筛选订单
  filterOrders({ commit, state }) {
    let filtered = [...state.orderList]
    
    const filters = state.searchFilters
    
    // 按订单号筛选
    if (filters.orderNo) {
      filtered = filtered.filter(order => 
        order.orderNo.toLowerCase().includes(filters.orderNo.toLowerCase())
      )
    }
    
    // 按核对状态筛选
    if (filters.checkStatus !== null && filters.checkStatus !== '') {
      filtered = filtered.filter(order => order.checkStatus === filters.checkStatus)
    }
    
    // 按出行人/入住人筛选
    if (filters.travelerName) {
      filtered = filtered.filter(order => 
        order.travelerName && order.travelerName.includes(filters.travelerName)
      )
    }
    
    // 按法人实体筛选
    if (filters.legalEntity) {
      filtered = filtered.filter(order => 
        order.legalEntity && order.legalEntity.includes(filters.legalEntity)
      )
    }
    
    // 按业务类型筛选
    if (filters.businessType) {
      filtered = filtered.filter(order => order.businessType === filters.businessType)
    }
    
    commit('SET_FILTERED_ORDERS', filtered)
  },
  
  // 批量查询订单
  async batchQueryOrders({ commit }, { billNo, orderNos }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 将订单号数组转换为逗号分隔的字符串
      const orderNosStr = Array.isArray(orderNos) ? orderNos.join(',') : orderNos
      
      const params = {
        orderNos: orderNosStr
      }
      
      const response = await mockApi.getBillOrders(billNo, params)
      
      commit('SET_FILTERED_ORDERS', response.data.list)
      commit('SET_BATCH_QUERY_ORDER_NOS', orderNos)
      
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新订单状态（根据账单）
  updateOrderStatusByBill({ commit }, { billNo, checkStatus }) {
    commit('UPDATE_ORDERS_STATUS', { billNo, checkStatus })
  },
  
  // 更新搜索条件
  updateSearchFilters({ commit, dispatch }, filters) {
    commit('SET_SEARCH_FILTERS', filters)
    dispatch('filterOrders')
  },
  
  // 重置搜索条件
  resetSearchFilters({ commit, dispatch }) {
    commit('RESET_SEARCH_FILTERS')
    dispatch('filterOrders')
  },
  
  // 更新选中的订单
  updateSelectedOrders({ commit }, orders) {
    commit('SET_SELECTED_ORDERS', orders)
  },
  
  // 批量更新订单数据
  async batchUpdateOrders({ commit, state }, { orderNos, updateData }) {
    try {
      // 调用mock API更新订单
      await mockApi.batchUpdateOrders({ orderNos, updateData })
      
      // 更新本地状态
      state.orderList.forEach(order => {
        if (orderNos.includes(order.orderNo)) {
          Object.assign(order, updateData)
        }
      })
      
      return { success: true }
    } catch (error) {
      throw error
    }
  },
  
  // 更新订单核对状态
  async updateOrderCheckStatus({ commit, state }, { orderNos, checkStatus }) {
    try {
      // 调用mock API更新核对状态
      await mockApi.updateOrderCheckStatus({ orderNos, checkStatus })
      
      // 更新本地状态
      state.orderList.forEach(order => {
        if (orderNos.includes(order.orderNo)) {
          order.checkStatus = checkStatus
        }
      })
      
      return { success: true }
    } catch (error) {
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

