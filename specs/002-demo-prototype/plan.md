# Implementation Plan: 结算平台Demo原型

**Branch**: `002-demo-prototype` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-demo-prototype/spec.md`

**Note**: This is a simplified implementation plan for a demo prototype. Focus is on rapid development and visual demonstration rather than production-grade architecture.

## Summary

创建一个可视化的Demo原型，使用前端模拟数据展示企业结算平台的核心功能流程（账单核对、发票申请、数据筛选、权限控制）。Demo在本地运行，不依赖后端API，仅用于向stakeholders演示产品方向和用户体验。开发周期5个工作日，使用Vue.js 2.x + Element UI + Mock.js构建。

## Technical Context

**Language/Version**: JavaScript (ES6+) / Vue.js 2.7.12  
**Primary Dependencies**: 
  - Vue.js 2.7.12（核心框架）
  - Element UI 2.13.0（UI组件库）
  - Vue Router 3.x（路由管理，简化版）
  - Mock.js 1.1.0（数据模拟）
  - Moment.js 2.25.1（时间处理）
  - Lodash 4.17.14（工具函数）

**Build Tools**:
  - Webpack 3.x（模块打包）
  - Babel 6.x（ES6+转译）
  - Less 3.9.0（CSS预处理）
  - webpack-dev-server（开发服务器）

**Storage**: 
  - LocalStorage（用户类型切换、演示状态保存）
  - 内存状态（组件内部状态管理，不使用Vuex）
  - Mock.js内存数据（所有业务数据）

**Testing**: 
  - 手动测试（演示流程验证）
  - 不要求编写自动化测试（demo阶段）

**Target Platform**: 
  - 现代桌面浏览器（Chrome 90+为主，Firefox/Safari兼容）
  - 分辨率：1280px及以上
  - 不支持IE浏览器和移动端

**Project Type**: Web Application (Frontend Demo - Standalone SPA)

**Performance Goals**: 
  - 首屏加载时间 < 2秒
  - 页面交互响应时间 < 500毫秒
  - 模拟数据生成时间 < 100毫秒
  - 模拟异步操作（如确认账单、申请发票）延迟 2-3秒

**Constraints**: 
  - 打包后大小 < 2MB（gzip压缩后）
  - 所有数据在前端模拟，无后端依赖
  - 仅本地运行，不部署到服务器
  - 刷新页面后状态重置为初始数据

**Scale/Scope**: 
  - 4个用户故事（P1-P4优先级）
  - 5-8个页面组件（账单列表、账单详情、发票申请、发票列表等）
  - 20-30个业务组件（表格、表单、卡片等）
  - 3-5个账单包（模拟数据）
  - 20-50条订单明细/账单包
  - 5-10张发票/批次
  - 开发周期：5个工作日

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

基于项目编码规范文档（`.cursor/commands/speckit.constitution.md`）的检查：

### ✅ 通过的规范要求

1. **技术栈一致性**: 
   - ✅ 使用 Vue.js 2.7.12（符合规范要求）
   - ✅ 使用 Element UI 2.13.0（符合规范要求）
   - ✅ 使用 Webpack 3.x + Babel 6.x（符合规范要求）
   - ✅ 所有核心依赖版本与规范一致

2. **代码风格规范**: 
   - ✅ 使用 Prettier 格式化（120字符行宽、双引号、分号、2空格缩进）
   - ✅ 使用 ESLint 进行代码质量检查
   - ✅ 组件命名使用 PascalCase（如 `BillList.vue`）
   - ✅ JavaScript 文件使用 camelCase（如 `mockData.js`）

3. **组件结构规范**: 
   - ✅ Vue 组件按照标准结构组织（template → script → style）
   - ✅ Props 定义包含类型、默认值（简化版，demo阶段不强制所有验证规则）
   - ✅ 使用 Less 进行样式编写，使用 scoped 限定作用域

### ⚠️ Demo阶段简化的规范

以下规范在demo阶段**允许简化**，不视为违反规范：

1. **状态管理**: Demo不强制使用Vuex，可以使用组件内部状态或简单的事件总线
2. **API调用**: Demo使用Mock.js模拟所有API，不需要真实的Axios请求和拦截器配置
3. **测试**: Demo阶段不要求编写单元测试和E2E测试，仅进行手动测试
4. **路由守卫**: Demo不需要完整的权限路由守卫，可以简化
5. **错误处理**: Demo只需基础的错误提示，不需要完整的错误日志系统
6. **性能优化**: Demo不需要虚拟滚动、代码分割等高级优化，可以限制数据量或简单分页

### 📋 Constitution符合性总结

- **总体符合度**: 90%（demo简化版）
- **简化项目**: 6项（见上述列表）
- **无需额外调整**: 核心规范（技术栈、代码风格、组件结构）完全遵循

## Project Structure

### Documentation (this feature)

```text
specs/002-demo-prototype/
├── spec.md              # 特性规范（已完成）
├── plan.md              # 本文件（实现计划）
├── mock-data.md         # Mock数据设计（Phase 0 输出）
├── quickstart.md        # 快速开始指南（Phase 1 输出）
├── checklists/          # 检查清单
│   └── requirements.md  # 需求质量检查清单（已完成）
└── demo-script.md       # 演示脚本（可选，用于stakeholder演示）
```

**注意**: Demo不需要完整的 `research.md`、`data-model.md`、`contracts/`，这些在001-settlement-automation中已经定义，demo直接复用简化版本。

### Source Code (repository root)

```text
compMOS-demo/                      # Demo项目根目录（独立目录或在compMOS下）
├── src/                           # 源代码目录
│   ├── mock/                      # Mock数据
│   │   ├── mockData.js            # 模拟数据定义
│   │   ├── bills.js               # 账单包数据
│   │   ├── orders.js              # 订单明细数据
│   │   ├── invoices.js            # 发票数据
│   │   └── users.js               # 用户数据
│   │
│   ├── assets/                    # 静态资源
│   │   ├── images/                # 图片
│   │   └── styles/                # 全局样式
│   │       ├── variables.less     # Less变量
│   │       └── global.less        # 全局样式
│   │
│   ├── components/                # 组件
│   │   ├── common/                # 通用组件
│   │   │   ├── PageHeader.vue     # 页面头部
│   │   │   ├── StatusTag.vue      # 状态标签
│   │   │   └── LoadingButton.vue  # 加载按钮
│   │   ├── bill/                  # 账单组件
│   │   │   ├── BillCard.vue       # 账单卡片
│   │   │   ├── OrderTable.vue     # 订单表格
│   │   │   └── BillSummary.vue    # 账单汇总
│   │   └── invoice/               # 发票组件
│   │       ├── InvoiceForm.vue    # 发票表单
│   │       └── InvoiceList.vue    # 发票列表
│   │
│   ├── views/                     # 页面组件
│   │   ├── Home.vue               # 首页（可选）
│   │   ├── BillList.vue           # 账单列表
│   │   ├── BillDetail.vue         # 账单详情
│   │   ├── InvoiceApply.vue       # 发票申请
│   │   └── InvoiceList.vue        # 发票列表
│   │
│   ├── router/                    # 路由配置（简化版）
│   │   └── index.js               # 路由主文件
│   │
│   ├── utils/                     # 工具函数
│   │   ├── format.js              # 格式化函数
│   │   ├── constants.js           # 常量定义
│   │   └── helpers.js             # 辅助函数
│   │
│   ├── App.vue                    # 根组件
│   └── main.js                    # 入口文件
│
├── public/                        # 公共资源
│   ├── index.html                 # HTML模板
│   └── favicon.ico                # 网站图标
│
├── build/                         # 构建配置
│   ├── webpack.dev.conf.js        # 开发环境配置
│   └── webpack.prod.conf.js       # 生产环境配置（demo可选）
│
├── config/                        # 项目配置
│   └── index.js                   # 主配置文件
│
├── .prettierrc.js                 # Prettier配置
├── .eslintrc.js                   # ESLint配置
├── package.json                   # 项目依赖
├── README.md                      # Demo说明
└── .gitignore                     # Git忽略文件
```

**Structure Decision**: 

采用简化的 Vue.js 单页应用目录结构，专为demo快速开发优化：

1. **Mock数据独立目录**（`src/mock/`）：所有模拟数据集中管理，按业务模块分文件（bills.js、orders.js、invoices.js），便于维护和展示不同场景。

2. **组件精简**：
   - 仅创建demo演示必需的组件，避免过度设计
   - 通用组件（common/）仅包含3-5个基础组件
   - 业务组件（bill/、invoice/）针对demo场景定制，不追求高复用性

3. **不使用Vuex**: Demo使用组件内部状态或简单的props/events通信，避免引入Vuex的复杂性，加快开发速度。

4. **路由简化**: 使用Vue Router但不需要复杂的路由守卫、懒加载、嵌套路由，直接定义4-5个页面路由即可。

5. **构建配置简化**: 仅配置开发环境构建（webpack.dev.conf.js），生产环境构建可选（如需打包分享）。

此结构符合项目编码规范的核心要求，同时针对demo快速迭代进行了合理简化。

## Complexity Tracking

> **本项目无需填写此部分** - Demo原型遵循项目编码规范的核心要求，允许的简化（如不使用Vuex、不编写测试）均在合理范围内，不违反规范原则。

---

## Phase 0: Mock Data Design

### Mock数据策略

Demo使用 **Mock.js** 在前端直接生成和管理所有模拟数据，不依赖后端服务。

#### 数据生成方式

1. **静态数据 + 动态生成结合**:
   - 核心数据（如账单包、订单明细）使用预定义的静态数据，确保demo演示的一致性和可控性
   - 部分字段（如ID、时间戳）使用Mock.js动态生成，增加真实感

2. **数据分类**:
   - **账单包数据**（bills.js）: 3-5个账单包，涵盖不同状态（待对账、已核对、开票中、已结清）
   - **订单明细数据**（orders.js）: 每个账单包20-50条订单，涵盖三种业务类型（机票、火车票、酒店）
   - **发票数据**（invoices.js）: 每个批次5-10张发票，包含专票、普票、行程单
   - **用户数据**（users.js）: 2个模拟用户（预存企业、授信企业），用于权限演示

3. **数据关系**:
   - 账单包 → 订单明细（一对多）
   - 账单包 → 开票批次 → 发票（一对多对多）
   - 用户 → 企业类型 → 权限控制

#### Mock数据示例结构

**bills.js**:
```javascript
export const mockBills = [
  {
    billNo: 'BILL202601001',
    billCycle: '2026-01',
    billStatus: 0, // 0-待对账 1-已核对 2-开票中 3-已结清
    totalAmount: 125000.50,
    totalOrderCount: 45,
    hotelAmount: 50000,
    hotelCount: 20,
    flightAmount: 60000.50,
    flightCount: 15,
    trainAmount: 15000,
    trainCount: 10,
    createTime: '2026-01-01T00:00:00Z',
    confirmTime: null,
    settleTime: null
  },
  // ...更多账单包
];
```

**orders.js**:
```javascript
export const mockOrders = {
  'BILL202601001': [
    {
      orderNo: 'ORDER2026010100001',
      businessType: '002', // 001-酒店 002-机票 003-火车
      travelerName: '张三',
      payAmount: 3500.00,
      payTime: '2026-01-05T10:30:00Z',
      travelTime: '2026-01-10T08:00:00Z',
      checkStatus: false,
      costCenter: '技术部',
      invoiceTitle: '示例科技有限公司'
    },
    // ...更多订单
  ],
  // ...其他账单包的订单
};
```

#### 状态管理策略

Demo使用**组件内部状态**管理数据变更：

1. **初始数据加载**: 
   - 从mock文件导入初始数据
   - 在组件的 `data()` 或 `created()` 中初始化

2. **状态更新**: 
   - 用户操作（如勾选核对、确认账单）直接修改组件内的数据
   - 使用 `this.$set()` 或 `Vue.set()` 确保响应式更新

3. **跨组件通信**: 
   - 使用 `props` 向下传递数据
   - 使用 `$emit` 向上传递事件
   - 简单的全局状态（如用户类型）可以使用 `localStorage` 或全局事件总线

4. **页面刷新**: 
   - 每次刷新页面，数据重置为初始状态
   - 不需要持久化机制（demo特性）

**Output**: `mock-data.md` 文档，详细定义所有模拟数据的结构和生成规则

---

## Phase 1: Component & Page Design

### 核心组件设计

#### 1. 通用组件（common/）

**PageHeader.vue**:
- 功能：展示页面标题和面包屑导航
- Props: `title`, `breadcrumb`
- 复杂度：简单

**StatusTag.vue**:
- 功能：展示账单/发票状态标签（带颜色和图标）
- Props: `status`, `type`
- 复杂度：简单

**LoadingButton.vue**:
- 功能：带加载状态的按钮，防止重复提交
- Props: `loading`, `text`, `loadingText`
- 事件: `@click`
- 复杂度：简单

#### 2. 账单组件（bill/）

**BillCard.vue**:
- 功能：账单包卡片，展示账单摘要信息
- Props: `bill`（账单包对象）
- 事件: `@view-detail`（点击查看详情）
- 复杂度：中等

**OrderTable.vue**:
- 功能：订单明细表格，支持勾选核对、搜索、筛选
- Props: `orders`（订单列表）、`editable`（是否可编辑）
- 事件: `@check-change`（核对状态变更）
- 复杂度：高

**BillSummary.vue**:
- 功能：账单汇总统计，展示已核对/总数等
- Props: `summary`（汇总数据对象）
- 复杂度：简单

#### 3. 发票组件（invoice/）

**InvoiceForm.vue**:
- 功能：发票申请表单，包含表单验证
- Props: `billNo`（关联账单编号）
- 事件: `@submit`（提交申请）
- 复杂度：中等

**InvoiceList.vue**:
- 功能：发票列表，展示发票卡片或表格
- Props: `invoices`（发票列表）
- 事件: `@view-invoice`（查看发票详情）
- 复杂度：中等

### 页面组件设计

#### BillList.vue（账单列表页）
- **路由**: `/bills`
- **功能**: 
  - 展示账单包列表（卡片或表格形式）
  - 支持按状态、账单周期筛选
  - 点击卡片进入账单详情
- **组件使用**: `BillCard`, `StatusTag`, `PageHeader`
- **数据来源**: `mockBills`

#### BillDetail.vue（账单详情页）
- **路由**: `/bills/:billNo`
- **功能**: 
  - 展示账单基本信息和汇总统计
  - 展示订单明细表格，支持勾选核对
  - 搜索和筛选订单
  - 确认账单（更新状态）
  - 跳转到发票申请页
- **组件使用**: `OrderTable`, `BillSummary`, `LoadingButton`, `PageHeader`
- **数据来源**: `mockBills`, `mockOrders`

#### InvoiceApply.vue（发票申请页）
- **路由**: `/invoices/apply?billNo=xxx`
- **功能**: 
  - 填写发票信息（抬头、税号、收货地址）
  - 提交申请（模拟延迟2秒）
  - 提交成功后跳转到发票列表
- **组件使用**: `InvoiceForm`, `LoadingButton`, `PageHeader`
- **数据来源**: `mockUsers`（预填充企业信息）

#### InvoiceList.vue（发票列表页）
- **路由**: `/invoices`
- **功能**: 
  - 展示发票批次列表
  - 展示每个批次的发票列表
  - 模拟开票进度（进度条动画）
  - 查看发票详情（模拟PDF预览或详情弹窗）
- **组件使用**: `InvoiceList`, `StatusTag`, `PageHeader`
- **数据来源**: `mockInvoices`

### 交互流程设计

**流程1: 账单核对**
1. 用户访问账单列表页 (`/bills`)
2. 点击"待对账"状态的账单卡片
3. 进入账单详情页 (`/bills/BILL202601001`)
4. 勾选订单的"已核对"复选框
5. 底部统计实时更新（已核对X/总数Y）
6. 点击"全部确认"按钮
7. 弹出确认对话框，点击"确认"
8. 模拟延迟2秒，显示加载状态
9. 账单状态更新为"已核对"，显示成功提示
10. 返回账单列表，账单卡片状态标签更新

**流程2: 发票申请**
1. 用户在账单详情页（状态为"已核对"）
2. 点击"申请发票"按钮
3. 跳转到发票申请页 (`/invoices/apply?billNo=xxx`)
4. 表单预填充企业默认信息
5. 用户确认或修改信息，点击"提交申请"
6. 模拟延迟2-3秒，显示加载状态
7. 提交成功，生成批次记录
8. 跳转到发票列表页 (`/invoices`)
9. 展示批次"开票中"状态，进度条动画
10. 模拟3秒后批次完成，状态变为"开票完成"
11. 展示发票列表

**流程3: 权限控制演示**
1. 用户在页面顶部切换用户类型（下拉菜单：预存企业/授信企业）
2. 切换到"授信企业"
3. 访问账单详情页
4. "批量调账"按钮隐藏或禁用
5. 鼠标悬停显示提示："该功能仅对预存企业开放"
6. 切换回"预存企业"
7. "批量调账"按钮显示并可用
8. 选中订单，点击"批量调账"
9. 弹出调账表单，修改成本中心
10. 保存成功，订单字段更新

**Output**: 
- `quickstart.md`：Demo快速启动指南
- 组件和页面代码框架（关键组件的结构定义）

---

## Next Steps

本实现计划（plan.md）已完成Phase 0和Phase 1的规划。接下来的步骤：

1. **Phase 0: 创建Mock数据设计**
   - 生成 `mock-data.md` 文档，详细定义所有模拟数据结构
   - 准备示例数据文件（bills.js、orders.js、invoices.js、users.js）

2. **Phase 1: 创建快速启动指南**
   - 生成 `quickstart.md`，包含5分钟快速启动步骤
   - 提供环境准备、项目初始化、运行demo的详细说明

3. **Phase 2: 任务分解**
   - 执行 `/speckit.tasks` 命令
   - 生成 `tasks.md`，按优先级分解开发任务（P1-P4对应5天开发计划）

4. **Phase 3: 实施开发**
   - Day 1-2: P1账单核对流程
   - Day 3: P2发票申请流程
   - Day 4: P3数据筛选与导出
   - Day 5: P4调账功能 + 整体测试

5. **Phase 4: 演示准备**
   - 准备演示脚本（demo-script.md）
   - 准备反馈收集表格
   - 在实际演示环境测试

---

**Plan Version**: 1.0  
**Last Updated**: 2026-01-16  
**Status**: Phase 0 Planning Complete - Ready for Mock Data Design
