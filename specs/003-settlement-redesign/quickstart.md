# Quick Start Guide: 结算平台UI重构

**Feature**: 003-settlement-redesign  
**Date**: 2026-01-22

## 🚀 快速开始（5分钟）

### 前置要求

```bash
Node.js >= 16.0.0
npm >= 7.0.0
# 或者
yarn >= 1.22.0
```

### 安装依赖

```bash
cd /Users/egeorg/Desktop/compMOS/compMOS-demo
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:8080

---

## 📁 项目结构

```
compMOS-demo/
├── src/
│   ├── main.js                 # 应用入口
│   ├── App.vue                 # 根组件
│   ├── router/                 # 路由配置
│   ├── store/                  # Vuex状态管理（新增）
│   │   ├── index.js
│   │   └── modules/            # 模块化Store
│   │       ├── bill.js
│   │       ├── order.js
│   │       ├── invoice.js
│   │       ├── config.js
│   │       └── user.js
│   ├── api/                    # API服务层（新增）
│   │   ├── request.js          # Axios配置
│   │   ├── bill.js
│   │   ├── invoice.js
│   │   └── config.js
│   ├── components/             # Vue组件
│   │   ├── common/             # 公共组件
│   │   ├── layout/             # 布局组件（简化）
│   │   └── bill/               # 账单相关组件
│   ├── pages/                  # 页面组件
│   │   ├── BillList.vue        # 账单列表页（重构）
│   │   ├── BillDetail.vue      # 账单详情页（重构）
│   │   └── InvoiceApply.vue    # 开票申请页（新增）
│   ├── utils/                  # 工具函数
│   │   ├── constants.js
│   │   ├── format.js
│   │   ├── validators.js       # 表单验证（新增）
│   │   ├── storage.js
│   │   └── errorHandler.js     # 错误处理（新增）
│   ├── assets/                 # 静态资源
│   │   └── styles/
│   └── mock/                   # Mock数据（开发阶段）
├── tests/                      # 测试文件（新增）
│   ├── unit/                   # 单元测试
│   └── e2e/                    # E2E测试
├── package.json
├── webpack.config.js
├── jest.config.js              # Jest配置（新增）
└── cypress.config.js           # Cypress配置（新增）
```

---

## 🔧 开发环境配置

### 1. 环境变量

创建 `.env.development` 文件：

```bash
# API基础URL
VUE_APP_BASE_API=http://localhost:3000/api/v1

# 是否启用Mock数据
VUE_APP_USE_MOCK=true

# 环境标识
NODE_ENV=development
```

创建 `.env.production` 文件：

```bash
# API基础URL
VUE_APP_BASE_API=https://api.compmos.com/v1

# 生产环境不使用Mock数据
VUE_APP_USE_MOCK=false

# 环境标识
NODE_ENV=production
```

### 2. Mock数据开发模式

在开发阶段，系统默认使用Mock数据。Mock数据文件位于 `src/mock/` 目录：

```javascript
// src/mock/mockData.js
export const mockBills = [
  {
    billNo: 'BILL-2025-001',
    billPeriod: '2025-09',
    billStatus: 0,  // 待确认
    totalAmount: 49144.76,
    // ... 其他字段
  }
]

export const mockOrders = [
  // ... 订单Mock数据
]
```

### 3. 切换到真实API

修改 `src/main.js`：

```javascript
// 注释掉Mock数据引入
// import '@/mock/mockData'
```

或者设置环境变量：

```bash
VUE_APP_USE_MOCK=false npm run dev
```

---

## 📝 开发规范

### 代码风格

```bash
# ESLint检查
npm run lint

# 自动修复
npm run lint:fix

# Prettier格式化
npm run format
```

### Git提交规范

```bash
# 格式：type(scope): subject

# 示例
git commit -m "feat(bill): 添加账单确认功能"
git commit -m "fix(invoice): 修复开票金额计算错误"
git commit -m "style(ui): 优化账单列表样式"
git commit -m "refactor(store): 重构Vuex store结构"
git commit -m "test(bill): 添加账单确认单元测试"
git commit -m "docs(readme): 更新快速启动文档"
```

**Type类型**:
- `feat`: 新功能
- `fix`: 修复bug
- `style`: 样式修改
- `refactor`: 重构代码
- `test`: 添加测试
- `docs`: 文档更新
- `chore`: 构建/工具相关

---

## 🧪 测试

### 单元测试

```bash
# 运行所有单元测试
npm run test:unit

# 监听模式（开发时使用）
npm run test:unit -- --watch

# 生成覆盖率报告
npm run test:unit -- --coverage
```

### E2E测试

```bash
# 运行E2E测试（需先启动开发服务器）
npm run test:e2e

# Headless模式（CI环境）
npm run test:e2e:headless

# 打开Cypress测试界面
npm run test:e2e:open
```

### 测试示例

**单元测试示例** (`tests/unit/store/bill.spec.js`):

```javascript
import bill from '@/store/modules/bill'
import * as billApi from '@/api/bill'

jest.mock('@/api/bill')

describe('bill store module', () => {
  it('should update bill status when confirmBill succeeds', async () => {
    const mockResponse = {
      data: {
        billStatus: 1,
        confirmTime: '2026-01-22T10:30:00Z'
      }
    }
    
    billApi.confirmBill.mockResolvedValue(mockResponse)
    
    const store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }
    
    await bill.actions.confirmBill(store, 'BILL-2025-001')
    
    expect(store.commit).toHaveBeenCalledWith(
      'UPDATE_BILL_STATUS',
      expect.objectContaining({ billStatus: 1 })
    )
  })
})
```

**E2E测试示例** (`tests/e2e/bill-flow.spec.js`):

```javascript
describe('账单确认流程', () => {
  it('should confirm bill successfully', () => {
    cy.visit('/bills')
    cy.contains('查看详情').first().click()
    cy.contains('确认账单').click()
    cy.get('.el-message-box').within(() => {
      cy.contains('确认').click()
    })
    cy.contains('待开票').should('be.visible')
  })
})
```

---

## 🏗️ 构建和部署

### 构建生产版本

```bash
# 构建
npm run build

# 输出目录：dist/
```

### 构建产物

```
dist/
├── index.html
├── js/
│   ├── app.[hash].js       # 应用代码
│   ├── vendor.[hash].js    # 第三方库
│   └── chunk.[hash].js     # 代码分割chunk
├── css/
│   └── app.[hash].css
└── assets/
    └── ...
```

### 部署

#### 方式1: 静态服务器（Nginx）

```nginx
server {
    listen 80;
    server_name compmos.com;
    root /var/www/compmos/dist;
    index index.html;

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass https://api.compmos.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

#### 方式2: CDN部署

```bash
# 1. 构建
npm run build

# 2. 上传dist/目录到CDN
# 3. 配置CDN源站
# 4. 配置CDN缓存规则
#    - HTML文件: 不缓存或短时间缓存
#    - JS/CSS/图片: 长时间缓存（1年）
```

---

## 🐛 调试

### Vue Devtools

1. 安装 Vue Devtools 浏览器扩展
2. 打开浏览器开发者工具
3. 切换到 "Vue" 标签页
4. 可以查看组件树、Vuex状态、路由信息等

### Vuex状态调试

```javascript
// 在浏览器控制台
$store.state.bill.currentBill    // 查看当前账单
$store.getters                    // 查看所有getters
$store.dispatch('bill/confirmBill', 'BILL-2025-001')  // 触发action
```

### 网络请求调试

```javascript
// src/api/request.js
// 开启请求日志
axios.interceptors.request.use(config => {
  console.log('API Request:', config.url, config.params || config.data)
  return config
})

axios.interceptors.response.use(response => {
  console.log('API Response:', response.config.url, response.data)
  return response
})
```

---

## 📚 常见问题

### Q1: 如何添加新的API接口？

1. 在 `src/api/` 目录下对应的文件中添加API方法：

```javascript
// src/api/bill.js
export function confirmBill(billNo) {
  return request({
    url: `/bills/${billNo}/confirm`,
    method: 'post',
    data: { billNo }
  })
}
```

2. 在Vuex action中调用：

```javascript
// src/store/modules/bill.js
async confirmBill({ commit }, billNo) {
  const response = await billApi.confirmBill(billNo)
  commit('UPDATE_BILL_STATUS', response.data)
}
```

### Q2: 如何添加新的路由页面？

1. 在 `src/pages/` 目录创建页面组件
2. 在 `src/router/index.js` 添加路由配置：

```javascript
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('@/pages/NewPage.vue'),
  meta: { title: '新页面' }
}
```

### Q3: 如何修改Element UI主题色？

修改 `src/assets/styles/variables.less`:

```less
@primary-color: #409eff;  // 修改为你的主题色
```

### Q4: 如何处理跨域问题？

在 `webpack.config.js` 中配置代理：

```javascript
devServer: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      }
    }
  }
}
```

### Q5: 构建后文件过大怎么办？

1. 启用代码分割（已配置）
2. 使用CDN加载第三方库：

```javascript
// webpack.config.js
externals: {
  'vue': 'Vue',
  'element-ui': 'ELEMENT',
  'axios': 'axios'
}
```

```html
<!-- public/index.html -->
<script src="https://cdn.jsdelivr.net/npm/vue@2.7.12/dist/vue.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/element-ui@2.15.x/lib/index.js"></script>
```

3. 压缩图片资源
4. 启用Gzip压缩

---

## 📞 获取帮助

- **文档**: [项目Wiki](https://wiki.compmos.com)
- **问题反馈**: [GitHub Issues](https://github.com/compmos/compmos-demo/issues)
- **团队联系**: support@compmos.com
- **技术支持**: tech-support@compmos.com

---

## 🔗 相关链接

- [Vue.js 2.7 文档](https://v2.vuejs.org/)
- [Vuex 3.x 文档](https://v3.vuex.vuejs.org/)
- [Element UI 文档](https://element.eleme.io/)
- [Axios 文档](https://axios-http.com/)
- [Jest 文档](https://jestjs.io/)
- [Cypress 文档](https://www.cypress.io/)

---

**Last Updated**: 2026-01-22  
**Version**: 1.0.0

