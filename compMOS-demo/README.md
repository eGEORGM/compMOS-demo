# compMOS Demo - 企业自动化结算平台

## 项目简介

compMOS Demo是一个企业自动化结算平台的前端演示项目，实现了类似携程的账单管理、对账、开票、付款等核心功能。本项目采用Vue 2 + Element UI技术栈，使用Mock数据进行展示。

## 核心功能

### 1. 账单列表页
- 账单包查询和筛选（按时间范围、状态、订单号）
- 账单状态管理（待确认、调账中、待开票、开票中、待付款、已结清）
- 账单详情跳转

### 2. 账单详情页
- **账单汇总Tab**：展示账期汇总数据，支持多维度明细设置（业务线、法人实体、支付账户、部门）
- **账单明细Tab**：
  - 按业务线分Tab展示（机票、酒店、火车票、用车）
  - 支持订单搜索和筛选
  - 字段配置功能（显示字段、Excel导出字段、PDF导出字段）
  - 导出Excel和PDF功能
- **开票汇总Tab**：
  - 开票金额统计
  - 发票明细列表
  - 发票申请记录
  - 发票管理（下载、红冲、换开）

### 3. 账单确认流程
- 确认账单（将账单状态从"待确认"变更为"待开票"）
- 撤销确认（开票中状态除外）

### 4. 开票申请流程
- 一键开票跳转到开票页
- 开票信息表单填写（发票类型、抬头、接收人、数量等）
- 拆分汇总配置（按业务线、法人实体等维度拆分）
- 开票信息分组展示

### 5. 发票管理
- 发票申请记录列表
- 发票下载、红冲、换开操作
- 发票状态跟踪

## 技术栈

- **框架**: Vue 2.6.14
- **UI组件库**: Element UI 2.15.14
- **状态管理**: Vuex 3.6.2
- **路由**: Vue Router 3.5.1
- **HTTP客户端**: Axios 1.7.9
- **日期处理**: Day.js 1.11.13
- **Mock数据**: Mock.js 1.1.0
- **Excel导出**: xlsx 0.18.5
- **CSS预处理器**: Less 4.1.3
- **构建工具**: Webpack 4.47.0 + Vue CLI Service

## 项目结构

```
compMOS-demo/
├── public/                  # 静态资源
├── src/
│   ├── api/                # API接口定义
│   │   └── request.js      # Axios封装
│   ├── assets/             # 静态资源
│   │   └── styles/         # 全局样式
│   │       ├── variables.less  # Less变量
│   │       └── global.less     # 全局样式
│   ├── components/         # 组件
│   │   ├── bill/          # 账单相关组件
│   │   │   ├── BillSummaryContent.vue       # 账单汇总内容
│   │   │   ├── OrderListContent.vue         # 订单列表内容
│   │   │   ├── InvoiceSummaryContent.vue    # 开票汇总内容
│   │   │   ├── BillDetailSettings.vue       # 明细设置
│   │   │   ├── FieldConfigDialog.vue        # 字段配置
│   │   │   ├── InvoiceRecordTable.vue       # 发票申请记录表
│   │   │   ├── InvoiceSplitConfig.vue       # 拆分汇总配置
│   │   │   ├── InvoiceForm.vue              # 开票表单
│   │   │   └── InvoiceTitleSelector.vue     # 发票抬头选择器
│   │   ├── common/        # 通用组件
│   │   │   ├── PageLoading.vue              # 页面加载组件
│   │   │   ├── EmptyState.vue               # 空状态组件
│   │   │   └── ErrorMessage.vue             # 错误消息组件
│   │   └── layout/        # 布局组件
│   │       └── MainLayout.vue               # 主布局
│   ├── mock/              # Mock数据
│   │   ├── index.js       # Mock API入口
│   │   ├── billsNew.js    # 账单Mock数据
│   │   ├── ordersNew.js   # 订单Mock数据
│   │   └── invoicesNew.js # 发票Mock数据
│   ├── pages/             # 页面组件
│   │   ├── BillList.vue   # 账单列表页
│   │   ├── BillDetail.vue # 账单详情页
│   │   └── InvoiceApply.vue # 开票申请页
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── store/             # Vuex状态管理
│   │   ├── index.js       # Store入口
│   │   └── modules/
│   │       ├── bill.js    # 账单模块
│   │       ├── order.js   # 订单模块
│   │       ├── invoice.js # 开票模块
│   │       └── config.js  # 配置模块
│   ├── utils/             # 工具函数
│   │   ├── constants.js   # 常量定义
│   │   ├── format.js      # 格式化函数
│   │   ├── validators.js  # 验证函数
│   │   ├── errorHandler.js # 错误处理
│   │   ├── storage.js     # 本地存储
│   │   └── excel.js       # Excel导出
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── .babelrc               # Babel配置
├── .eslintrc.js           # ESLint配置
├── .prettierrc            # Prettier配置
├── package.json           # 项目依赖
├── vue.config.js          # Vue CLI配置
└── README.md              # 项目文档
```

## 快速开始

### 环境要求

- Node.js >= 12.x
- npm >= 6.x 或 yarn >= 1.x

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:8080 查看应用

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

构建产物在 `dist/` 目录

### 代码检查和格式化

```bash
# ESLint检查
npm run lint

# Prettier格式化
npm run format
```

## 核心流程说明

### 账单确认流程

1. 用户进入账单列表，选择"待确认"状态的账单
2. 点击"查看详情"进入账单详情页
3. 在"账单汇总"或"账单明细"Tab中查看数据
4. 点击"确认账单"按钮，触发二次确认弹窗
5. 确认后账单状态变更为"待开票"

### 开票申请流程

1. 账单确认后，点击"一键开票"按钮
2. 跳转到开票申请页
3. （可选）点击"拆分汇总"配置拆分维度
4. 填写开票信息（发票类型、抬头、接收人等）
5. 点击"申请开票"提交
6. 账单状态变更为"开票中"

### 发票管理流程

1. 在账单详情的"开票汇总"Tab查看发票列表
2. 对已开具的发票执行操作：
   - **下载**：下载发票PDF
   - **红冲**：作废当前发票（需填写红冲原因）
   - **换开**：红冲后重新开具（需填写新的发票抬头）

## 数据流说明

### Vuex状态管理

项目使用Vuex进行状态管理，分为以下模块：

- **bill**: 账单数据和操作
- **order**: 订单数据和筛选
- **invoice**: 发票数据和开票流程
- **config**: 用户配置（明细设置、字段配置）

### Mock数据

项目使用Mock.js生成模拟数据，所有API调用在`src/mock/index.js`中拦截并返回Mock数据。

主要Mock数据：
- 账单包数据：6个月的历史账单
- 订单数据：机票、酒店、火车票、用车等业务线
- 发票数据：发票申请记录、已开具发票列表

### LocalStorage持久化

以下配置数据会保存到LocalStorage：
- 明细设置配置（拆分维度）
- 字段配置（显示字段、导出字段）

## 开发指南

### 组件开发规范

1. **组件命名**：使用PascalCase，文件名与组件名一致
2. **Props验证**：所有Props必须定义类型和默认值
3. **事件命名**：使用kebab-case，如`@update-data`
4. **样式作用域**：使用scoped样式，避免全局污染

### 状态管理规范

1. 所有异步操作在actions中处理
2. Mutations只做同步状态更新
3. 使用Getters进行数据派生和计算

### 代码风格

项目使用ESLint + Prettier保证代码风格一致：
- 2空格缩进
- 单引号字符串
- 末尾分号
- 最大行长120字符

## 浏览器支持

- Chrome >= 60
- Firefox >= 60
- Safari >= 11
- Edge >= 79

## 已知限制

1. 本项目为Demo演示，使用Mock数据，不包含真实的后端服务
2. PDF导出功能为模拟实现，实际生产环境需要后端支持
3. 文件下载功能使用模拟链接，需要后端提供真实的文件存储服务
4. 用户权限和认证功能未实现，需要集成SSO或OAuth

## 后续计划

- [ ] 集成真实后端API
- [ ] 实现用户认证和权限控制
- [ ] 添加单元测试和E2E测试
- [ ] 优化大数据量场景下的性能（虚拟滚动）
- [ ] 支持更多业务场景（企业购、通用订单等）
- [ ] 实现调账功能
- [ ] 数据权限隔离

## 许可证

MIT License

## 联系方式

如有问题，请联系项目维护者。

