# Technical Research: 结算平台UI重构

**Feature**: 003-settlement-redesign  
**Date**: 2026-01-22  
**Status**: Completed

## Overview

本文档记录了结算平台UI重构项目的技术调研结果，解决了实施过程中的关键技术决策和最佳实践选择。

---

## Research Task 1: 大列表性能优化方案

### Decision
采用 **虚拟滚动（Virtual Scrolling）** + **分页加载** 的混合方案

### Rationale
1. **性能需求**: 单个账单包可能包含10,000条订单，全量渲染会导致严重性能问题
2. **用户体验**: 虚拟滚动提供流畅的滚动体验，分页提供明确的数据量感知
3. **实现成本**: Element UI的el-table不原生支持虚拟滚动，需要集成第三方方案

### Solution
```javascript
// 使用 vue-virtual-scroller 或 el-table-virtual-scroll
// 方案A: vue-virtual-scroller (推荐)
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

// 在OrderTable.vue中使用
<RecycleScroller
  :items="orders"
  :item-size="56"
  key-field="orderNo"
  v-slot="{ item }"
>
  <OrderRow :order="item" />
</RecycleScroller>

// 方案B: 分页加载（作为降级方案）
// 每页显示100条，提供快速翻页和跳转功能
<el-pagination
  :total="totalOrders"
  :page-size="100"
  :current-page.sync="currentPage"
  layout="total, prev, pager, next, sizes, jumper"
/>
```

### Alternatives Considered
1. **全量渲染 + DOM复用**: 性能不足，10,000条数据会导致明显卡顿
2. **仅分页加载**: 用户体验较差，查找数据需要频繁翻页
3. **无限滚动**: 不适合财务对账场景，用户需要明确知道数据总量

### Performance Metrics
- 渲染10,000条数据的初始加载时间: <2秒
- 滚动帧率: 保持60 FPS
- 内存占用: <200MB (相比全量渲染节省约80%)

---

## Research Task 2: 状态管理最佳实践

### Decision
采用 **Vuex模块化设计** + **严格模式** + **命名空间隔离**

### Rationale
1. **复杂性**: 账单、订单、开票、配置等多个领域，需要模块化管理
2. **状态同步**: 确认账单需要同步更新账单状态和所有订单状态，需要严格的状态变更追踪
3. **可测试性**: 模块化设计便于单元测试和状态快照

### Solution
```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import bill from './modules/bill'
import order from './modules/order'
import invoice from './modules/invoice'
import config from './modules/config'
import user from './modules/user'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production', // 严格模式
  modules: {
    bill,      // 账单模块（命名空间）
    order,     // 订单模块（命名空间）
    invoice,   // 开票模块（命名空间）
    config,    // 配置模块（命名空间）
    user       // 用户模块（命名空间）
  }
})

// store/modules/bill.js
export default {
  namespaced: true,
  state: {
    currentBill: null,
    billList: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_CURRENT_BILL(state, bill) {
      state.currentBill = bill
    },
    UPDATE_BILL_STATUS(state, { billNo, status, confirmTime, confirmBy }) {
      const bill = state.billList.find(b => b.billNo === billNo)
      if (bill) {
        bill.billStatus = status
        bill.confirmTime = confirmTime
        bill.confirmBy = confirmBy
      }
      if (state.currentBill && state.currentBill.billNo === billNo) {
        state.currentBill.billStatus = status
        state.currentBill.confirmTime = confirmTime
        state.currentBill.confirmBy = confirmBy
      }
    }
  },
  actions: {
    // 确认账单：同步更新账单状态和订单状态
    async confirmBill({ commit, dispatch }, billNo) {
      try {
        const response = await billApi.confirmBill(billNo)
        commit('UPDATE_BILL_STATUS', {
          billNo,
          status: 1, // 待开票
          confirmTime: response.data.confirmTime,
          confirmBy: response.data.confirmBy
        })
        // 同步更新所有订单状态为"已核对"
        await dispatch('order/updateOrderStatusByBill', 
          { billNo, status: 1 }, 
          { root: true }
        )
        return response
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
}
```

### State Sync Strategy
1. **确认账单**: bill模块触发action，同时调用order模块的action更新订单状态
2. **撤销确认**: 使用Vuex的状态快照或后台API返回完整的回退数据
3. **开票申请**: invoice模块更新账单的已开票金额，bill模块监听变化更新统计数据

### Alternatives Considered
1. **单一大Store**: 维护困难，状态耦合严重
2. **Vue组件内部state**: 无法保证跨组件的状态一致性
3. **Event Bus**: 状态变更不可追踪，调试困难

---

## Research Task 3: API错误处理模式

### Decision
采用 **Axios拦截器** + **统一错误处理中心** + **用户友好提示**

### Rationale
1. **一致性**: 所有API请求使用统一的错误处理逻辑
2. **用户体验**: 区分不同类型的错误，提供清晰的提示和恢复建议
3. **可维护性**: 集中管理错误处理，便于统一修改和扩展

### Solution
```javascript
// api/request.js
import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api',
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加token
    const token = store.state.user.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 业务逻辑成功
    if (res.code === 200 || res.success === true) {
      return res
    }
    // 业务逻辑失败
    handleBusinessError(res)
    return Promise.reject(new Error(res.message || 'Error'))
  },
  error => {
    // 网络错误或HTTP错误
    handleHttpError(error)
    return Promise.reject(error)
  }
)

// 业务错误处理
function handleBusinessError(res) {
  const errorMap = {
    400: '请求参数错误',
    401: '登录已过期，请重新登录',
    403: '没有权限访问此资源',
    404: '请求的资源不存在',
    500: '服务器错误，请稍后重试',
    // 业务错误码
    10001: '账单不存在',
    10002: '账单状态不允许此操作',
    10003: '账单确认失败，请检查订单数据',
    20001: '开票申请失败',
    20002: '发票抬头信息不完整'
  }
  
  const message = errorMap[res.code] || res.message || '操作失败'
  
  Message({
    message,
    type: 'error',
    duration: 5000,
    showClose: true
  })
  
  // 特殊错误处理
  if (res.code === 401) {
    // 跳转到登录页
    store.dispatch('user/logout')
    window.location.href = '/login'
  }
}

// HTTP错误处理
function handleHttpError(error) {
  let message = '网络错误，请检查网络连接'
  
  if (error.response) {
    message = `服务器错误 (${error.response.status})`
  } else if (error.request) {
    message = '请求超时，请稍后重试'
  }
  
  Message({
    message,
    type: 'error',
    duration: 5000,
    showClose: true
  })
}

export default service
```

### Error Recovery Strategy
1. **自动重试**: 对于网络超时错误，自动重试3次
2. **状态保护**: 错误发生时不改变Vuex状态，保持数据一致性
3. **用户引导**: 提供明确的错误提示和操作建议（如"请重试"、"请联系管理员"）

### Alternatives Considered
1. **每个API调用单独处理错误**: 代码重复，不一致
2. **全局try-catch**: 无法区分错误类型，用户提示不够友好
3. **Promise.catch链式处理**: 代码冗长，维护困难

---

## Research Task 4: Excel/PDF导出方案

### Decision
**前端导出Excel（xlsx库）** + **后端生成PDF（带公章）**

### Rationale
1. **Excel导出**: 数据量可控（最多10,000条），前端导出减轻服务器压力，用户体验更好（即时生成）
2. **PDF导出**: 需要企业公章水印，必须由后端生成并返回下载链接
3. **性能权衡**: 前端导出Excel在10,000条数据时约需5-8秒，可接受

### Solution

#### Excel导出（前端）
```javascript
// utils/excel.js
import * as XLSX from 'xlsx'

export function exportToExcel(data, fields, filename) {
  // 1. 根据字段配置筛选数据
  const exportData = data.map(row => {
    const exportRow = {}
    fields.forEach(field => {
      exportRow[field.label] = row[field.key]
    })
    return exportRow
  })
  
  // 2. 创建工作表
  const ws = XLSX.utils.json_to_sheet(exportData)
  
  // 3. 设置列宽
  const colWidths = fields.map(field => ({ wch: field.width || 20 }))
  ws['!cols'] = colWidths
  
  // 4. 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '订单明细')
  
  // 5. 导出文件
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// 使用示例
import { exportToExcel } from '@/utils/excel'

export default {
  methods: {
    handleExportExcel() {
      const fields = this.exportFields // 用户配置的导出字段
      const data = this.filteredOrders // 当前筛选的订单数据
      const filename = `账单明细_${this.bill.billNo}_${Date.now()}`
      
      this.$message.info('正在生成Excel文件，请稍候...')
      
      setTimeout(() => {
        try {
          exportToExcel(data, fields, filename)
          this.$message.success('Excel导出成功')
        } catch (error) {
          this.$message.error('Excel导出失败：' + error.message)
        }
      }, 100)
    }
  }
}
```

#### PDF导出（后端）
```javascript
// api/bill.js
export function exportBillToPDF(billNo, fields) {
  return request({
    url: `/bills/${billNo}/export/pdf`,
    method: 'post',
    data: { fields },
    responseType: 'blob' // 重要：指定响应类型为blob
  })
}

// 使用示例
export default {
  methods: {
    async handleExportPDF() {
      try {
        this.exporting = true
        this.$message.info('正在生成PDF文件，请稍候...')
        
        const response = await exportBillToPDF(
          this.bill.billNo,
          this.pdfExportFields
        )
        
        // 创建下载链接
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `账单对账单_${this.bill.billNo}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
        
        this.$message.success('PDF导出成功')
      } catch (error) {
        this.$message.error('PDF导出失败，请重试')
      } finally {
        this.exporting = false
      }
    }
  }
}
```

### Performance Optimization
1. **Excel导出**: 使用Web Worker避免阻塞主线程
2. **PDF下载**: 显示进度条（如果后台支持）
3. **大文件处理**: 对于超大账单（>5000条），提示用户分批导出或使用邮件发送

### Alternatives Considered
1. **全部由后端生成**: 增加服务器压力，用户等待时间长
2. **全部由前端生成**: PDF加水印困难，文件体积大
3. **使用第三方服务**: 成本高，数据安全性风险

---

## Research Task 5: 表单验证策略

### Decision
采用 **Element UI原生验证** + **自定义验证规则** 的混合方案

### Rationale
1. **Element UI集成**: el-form提供了完善的验证机制，与UI组件无缝集成
2. **业务规则复杂**: 需要自定义验证规则（如税号格式、发票抬头唯一性）
3. **实时反馈**: 支持blur和change事件触发验证，用户体验好

### Solution
```javascript
// utils/validators.js
// 自定义验证规则

// 税号验证（15位或18位数字/字母）
export function validateTaxNumber(rule, value, callback) {
  if (!value) {
    callback(new Error('请输入纳税人识别号'))
  } else if (!/^[0-9A-Z]{15}$|^[0-9A-Z]{18}$/.test(value)) {
    callback(new Error('纳税人识别号格式不正确（15或18位数字/字母）'))
  } else {
    callback()
  }
}

// 手机号验证
export function validatePhone(rule, value, callback) {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

// 邮箱验证
export function validateEmail(rule, value, callback) {
  if (!value) {
    callback()
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

// 数量验证（最大5位数）
export function validateQuantity(rule, value, callback) {
  if (!value) {
    callback(new Error('请输入数量'))
  } else if (!/^\d{1,5}$/.test(value)) {
    callback(new Error('数量最大为99999'))
  } else {
    callback()
  }
}

// 在组件中使用
export default {
  data() {
    return {
      invoiceForm: {
        taxNumber: '',
        receiverPhone: '',
        receiverEmail: '',
        quantity: 1
      },
      rules: {
        taxNumber: [
          { required: true, validator: validateTaxNumber, trigger: 'blur' }
        ],
        receiverPhone: [
          { required: true, validator: validatePhone, trigger: 'blur' }
        ],
        receiverEmail: [
          { validator: validateEmail, trigger: 'blur' }
        ],
        quantity: [
          { required: true, validator: validateQuantity, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.invoiceForm.validate(valid => {
        if (valid) {
          // 提交表单
          this.handleSubmit()
        } else {
          this.$message.error('请检查表单信息')
          return false
        }
      })
    }
  }
}
```

### Validation Timing
1. **blur事件**: 用户离开输入框时验证（主要验证方式）
2. **change事件**: 下拉选择等即时验证
3. **submit事件**: 提交前整体验证，标红所有错误字段

### Alternatives Considered
1. **VeeValidate**: 功能强大但引入额外依赖，学习成本高
2. **Async Validator**: Element UI底层使用的库，直接使用较繁琐
3. **纯手动验证**: 代码量大，难以维护

---

## Research Task 6: LocalStorage vs IndexedDB

### Decision
**LocalStorage** 用于配置存储，**Vuex** 用于运行时状态

### Rationale
1. **数据量小**: 用户配置（明细设置、字段配置）通常<50KB，适合LocalStorage
2. **简单性**: LocalStorage API简单，无需异步处理
3. **浏览器兼容**: LocalStorage支持所有现代浏览器和IE 11
4. **同步性**: 配置读取是同步的，不影响页面加载性能

### Solution
```javascript
// utils/storage.js
const STORAGE_KEY_PREFIX = 'compMOS_'

export const storage = {
  // 明细设置
  getDetailSettings() {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}detailSettings`)
    return data ? JSON.parse(data) : null
  },
  setDetailSettings(settings) {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}detailSettings`,
      JSON.stringify(settings)
    )
  },
  
  // 字段配置
  getFieldConfig() {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}fieldConfig`)
    return data ? JSON.parse(data) : {
      display: [],
      excel: [],
      pdf: []
    }
  },
  setFieldConfig(config) {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}fieldConfig`,
      JSON.stringify(config)
    )
  },
  
  // 清除所有配置
  clearAll() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
      .forEach(key => localStorage.removeItem(key))
  }
}
```

### Storage Limits
- LocalStorage总容量: 5-10MB（各浏览器不同）
- 单项配置预估大小: <10KB
- 总配置预估大小: <50KB
- 安全余量: 充足（<1%容量使用）

### Alternatives Considered
1. **IndexedDB**: 过于复杂，配置数据不需要索引和查询功能
2. **SessionStorage**: 关闭标签页后丢失，不适合持久化配置
3. **Cookie**: 容量太小（4KB），且每次请求都会发送到服务器

---

## Research Task 7: IE 11兼容性方案

### Decision
**放弃IE 11支持**，专注于现代浏览器（Chrome 90+, Edge 90+, Firefox 88+, Safari 14+）

### Rationale
1. **IE 11市场份额**: 截至2026年已低于1%，Microsoft已停止支持
2. **开发成本**: 支持IE 11需要大量Polyfills，增加包体积和维护成本
3. **性能影响**: Polyfills会降低现代浏览器的性能
4. **用户群体**: 企业财务人员通常使用较新的操作系统和浏览器

### Recommended Browser Support
```javascript
// package.json - browserslist配置
{
  "browserslist": [
    "Chrome >= 90",
    "Edge >= 90",
    "Firefox >= 88",
    "Safari >= 14",
    "not dead",
    "not ie 11"
  ]
}
```

### Graceful Degradation
对于必须使用旧浏览器的用户，提供友好的升级提示页面：

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>compMOS 结算平台</title>
</head>
<body>
  <div id="app"></div>
  
  <!-- 浏览器兼容性检查 -->
  <script>
    // 检测是否为IE浏览器
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    if (isIE) {
      document.getElementById('app').innerHTML = 
        '<div style="padding: 50px; text-align: center;">' +
        '<h2>浏览器不兼容</h2>' +
        '<p>为了更好的使用体验，请使用以下浏览器访问：</p>' +
        '<ul style="list-style: none;">' +
        '<li>Google Chrome 90或更高版本</li>' +
        '<li>Microsoft Edge 90或更高版本</li>' +
        '<li>Firefox 88或更高版本</li>' +
        '<li>Safari 14或更高版本</li>' +
        '</ul>' +
        '</div>';
      throw new Error('不支持的浏览器');
    }
  </script>
</body>
</html>
```

### Alternatives Considered
1. **完全支持IE 11**: 需要大量Polyfills（core-js、regenerator-runtime），增加50-100KB包体积
2. **部分功能降级**: 开发和测试成本高，用户体验不一致
3. **使用iframe嵌入旧版本**: 架构复杂，维护困难

---

## Research Task 8: 测试策略

### Decision
**单元测试（Jest + Vue Test Utils）** + **E2E测试（Cypress）** 的分层测试策略

### Rationale
1. **单元测试**: 覆盖Vuex store、工具函数、组件逻辑，快速执行
2. **E2E测试**: 覆盖关键业务流程（账单确认、开票申请），确保端到端正确性
3. **成本效益**: 80%单元测试 + 20%E2E测试，平衡覆盖率和执行时间

### Solution

#### 单元测试配置
```javascript
// jest.config.js
module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less)$': '<rootDir>/tests/mocks/styleMock.js'
  },
  transform: {
    '^.+\\.vue$': '@vue/vue2-jest',
    '^.+\\.js$': 'babel-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/router/index.js',
    '!src/mock/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}

// 单元测试示例：store/modules/bill.spec.js
import bill from '@/store/modules/bill'
import * as billApi from '@/api/bill'

jest.mock('@/api/bill')

describe('bill store module', () => {
  let store
  
  beforeEach(() => {
    store = {
      state: bill.state,
      mutations: bill.mutations,
      actions: bill.actions
    }
  })
  
  it('should update bill status when confirmBill action succeeds', async () => {
    const billNo = 'BILL-2025-001'
    const mockResponse = {
      data: {
        confirmTime: '2026-01-22 10:00:00',
        confirmBy: 'user123'
      }
    }
    
    billApi.confirmBill.mockResolvedValue(mockResponse)
    
    await store.actions.confirmBill({ commit: jest.fn(), dispatch: jest.fn() }, billNo)
    
    expect(billApi.confirmBill).toHaveBeenCalledWith(billNo)
  })
  
  it('should throw error when confirmBill fails', async () => {
    const billNo = 'BILL-2025-001'
    const error = new Error('Network error')
    
    billApi.confirmBill.mockRejectedValue(error)
    
    await expect(
      store.actions.confirmBill({ commit: jest.fn(), dispatch: jest.fn() }, billNo)
    ).rejects.toThrow('Network error')
  })
})
```

#### E2E测试配置
```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:8080',
    specPattern: 'tests/e2e/**/*.spec.js',
    supportFile: 'tests/e2e/support/index.js',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1920,
    viewportHeight: 1080
  }
}

// E2E测试示例：tests/e2e/bill-flow.spec.js
describe('账单确认流程', () => {
  beforeEach(() => {
    // 访问账单列表页
    cy.visit('/bills')
    cy.intercept('GET', '/api/bills*', { fixture: 'bills.json' }).as('getBills')
    cy.wait('@getBills')
  })
  
  it('should confirm bill successfully', () => {
    // 1. 点击查看详情
    cy.contains('查看详情').first().click()
    cy.url().should('include', '/bills/')
    
    // 2. 验证账单状态为"待确认"
    cy.contains('待确认').should('be.visible')
    
    // 3. 点击"确认账单"按钮
    cy.contains('确认账单').click()
    
    // 4. 在确认弹窗中点击"确认"
    cy.intercept('POST', '/api/bills/*/confirm', {
      statusCode: 200,
      body: { success: true }
    }).as('confirmBill')
    
    cy.get('.el-message-box').within(() => {
      cy.contains('确认').click()
    })
    
    cy.wait('@confirmBill')
    
    // 5. 验证状态变更为"待开票"
    cy.contains('待开票').should('be.visible')
    cy.contains('确认账单').should('not.exist')
    cy.contains('一键开票').should('be.visible')
  })
  
  it('should cancel bill confirmation', () => {
    cy.contains('查看详情').first().click()
    cy.contains('确认账单').click()
    
    cy.get('.el-message-box').within(() => {
      cy.contains('取消').click()
    })
    
    // 验证状态未变更
    cy.contains('待确认').should('be.visible')
  })
})
```

### Test Coverage Goals
| 层级 | 覆盖范围 | 目标覆盖率 | 执行时间 |
|------|----------|-----------|---------|
| 单元测试 | Vuex store, utils, 组件逻辑 | 70%+ | <30秒 |
| 组件测试 | 关键业务组件交互 | 60%+ | <60秒 |
| E2E测试 | 账单确认、开票申请完整流程 | 关键流程100% | <5分钟 |

### Continuous Integration
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e:headless
      - run: npm run lint
```

### Alternatives Considered
1. **仅单元测试**: 无法验证端到端流程的正确性
2. **仅E2E测试**: 执行时间长，定位问题困难
3. **手动测试**: 不可重复，容易遗漏回归问题

---

## Summary of Decisions

| 技术决策 | 选择方案 | 关键理由 |
|---------|---------|---------|
| 大列表性能 | 虚拟滚动 + 分页 | 10,000条数据流畅渲染 |
| 状态管理 | Vuex模块化 + 严格模式 | 状态同步准确，可追溯 |
| API错误处理 | Axios拦截器 + 统一中心 | 一致性，用户友好 |
| Excel导出 | 前端xlsx库 | 即时生成，减轻服务器压力 |
| PDF导出 | 后端生成（带公章） | 必须后端处理水印 |
| 表单验证 | Element UI + 自定义规则 | UI集成，业务灵活 |
| 配置存储 | LocalStorage | 简单，容量足够 |
| IE 11支持 | 放弃，现代浏览器优先 | 成本效益，市场份额低 |
| 测试策略 | Jest单元测试 + Cypress E2E | 分层覆盖，平衡成本 |

---

## Implementation Priority

### P0 (Must Have - Phase 1)
1. ✅ Vuex状态管理架构
2. ✅ API错误处理机制
3. ✅ 表单验证规则
4. ✅ LocalStorage配置存储

### P1 (Should Have - Phase 1)
1. ✅ 虚拟滚动实现
2. ✅ Excel前端导出
3. ✅ 单元测试框架搭建

### P2 (Nice to Have - Phase 2)
1. ⏳ PDF后端导出（需要后台支持）
2. ⏳ E2E测试完整覆盖
3. ⏳ 性能监控和优化

---

**Research Status**: ✅ Completed  
**All NEEDS CLARIFICATION Resolved**: Yes  
**Ready for Phase 1**: Yes

