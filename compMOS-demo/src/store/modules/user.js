// User Module - 用户管理
const state = {
  // 用户信息
  userInfo: {
    userId: '',
    userName: '',
    companyId: '',
    companyName: '',
    role: '',
    permissions: [],
    accountType: ''
  },
  
  // 认证信息
  token: localStorage.getItem('token') || null,
  tokenExpires: null,
  
  // UI状态
  loggedIn: false
}

const getters = {
  // 获取用户信息
  userInfo: state => state.userInfo,
  
  // 获取用户名
  userName: state => state.userInfo.userName,
  
  // 获取企业名称
  companyName: state => state.userInfo.companyName,
  
  // 获取账户类型
  accountType: state => state.userInfo.accountType,
  
  // 检查是否登录
  isLoggedIn: state => state.loggedIn && !!state.token,
  
  // 检查是否有权限
  hasPermission: state => permission => {
    return state.userInfo.permissions.includes(permission)
  },
  
  // 检查是否为预存账户
  isPrepaidAccount: state => state.userInfo.accountType === 'prepaid',
  
  // 检查是否为授信账户
  isCreditAccount: state => state.userInfo.accountType === 'credit'
}

const mutations = {
  // 设置用户信息
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
  },
  
  // 设置Token
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  
  // 设置Token过期时间
  SET_TOKEN_EXPIRES(state, expires) {
    state.tokenExpires = expires
  },
  
  // 设置登录状态
  SET_LOGGED_IN(state, loggedIn) {
    state.loggedIn = loggedIn
  },
  
  // 清除用户信息
  CLEAR_USER_INFO(state) {
    state.userInfo = {
      userId: '',
      userName: '',
      companyId: '',
      companyName: '',
      role: '',
      permissions: [],
      accountType: ''
    }
    state.token = null
    state.tokenExpires = null
    state.loggedIn = false
    localStorage.removeItem('token')
  }
}

const actions = {
  // 登录
  async login({ commit }, { username, password }) {
    try {
      // TODO: 调用登录API
      // const response = await userApi.login({ username, password })
      
      // Mock登录数据
      const mockUserInfo = {
        userId: 'user001',
        userName: '张三',
        companyId: 'company001',
        companyName: '厦门合思宏盛有限公司',
        role: 'finance',
        permissions: ['bill:view', 'bill:confirm', 'invoice:apply'],
        accountType: 'prepaid'
      }
      
      const mockToken = 'mock-token-' + Date.now()
      
      commit('SET_USER_INFO', mockUserInfo)
      commit('SET_TOKEN', mockToken)
      commit('SET_LOGGED_IN', true)
      
      return { success: true, data: mockUserInfo }
    } catch (error) {
      throw error
    }
  },
  
  // 登出
  logout({ commit }) {
    commit('CLEAR_USER_INFO')
  },
  
  // 获取用户信息
  async fetchUserInfo({ commit }) {
    try {
      // TODO: 调用获取用户信息API
      // const response = await userApi.getUserInfo()
      
      // Mock用户信息
      const mockUserInfo = {
        userId: 'user001',
        userName: '张三',
        companyId: 'company001',
        companyName: '厦门合思宏盛有限公司',
        role: 'finance',
        permissions: ['bill:view', 'bill:confirm', 'invoice:apply'],
        accountType: 'prepaid'
      }
      
      commit('SET_USER_INFO', mockUserInfo)
      commit('SET_LOGGED_IN', true)
      
      return { success: true, data: mockUserInfo }
    } catch (error) {
      throw error
    }
  },
  
  // 更新用户信息
  updateUserInfo({ commit }, userInfo) {
    commit('SET_USER_INFO', userInfo)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

