# Quickstart Guide: 企业自动化结算平台

**Feature**: 企业自动化结算平台 (compMOS)  
**Date**: 2026-01-15  
**Phase**: 1 - Design  
**Related**: [plan.md](./plan.md) | [spec.md](./spec.md) | [research.md](./research.md)

本指南帮助开发者快速搭建和运行compMOS项目。

---

## 目录

1. [环境要求](#1-环境要求)
2. [项目初始化](#2-项目初始化)
3. [本地开发](#3-本地开发)
4. [代码规范](#4-代码规范)
5. [测试](#5-测试)
6. [构建和部署](#6-构建和部署)
7. [常见问题](#7-常见问题)
8. [资源链接](#8-资源链接)

---

## 1. 环境要求

### 1.1 必需软件

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| **Node.js** | >= 12.0.0 | JavaScript运行环境 |
| **npm** | >= 6.0.0 | Node包管理器（随Node.js安装） |
| **Git** | >= 2.0.0 | 版本控制工具 |

### 1.2 推荐工具

- **VS Code**: 推荐的代码编辑器
- **Chrome**: 主要测试浏览器（90+）
- **Vue DevTools**: Vue调试工具（浏览器扩展）

### 1.3 检查环境

```bash
# 检查Node.js版本
node -v
# 应显示：v12.x.x 或更高版本

# 检查npm版本
npm -v
# 应显示：6.x.x 或更高版本

# 检查Git版本
git --version
# 应显示：git version 2.x.x 或更高版本
```

---

## 2. 项目初始化

### 2.1 克隆代码仓库

```bash
# 克隆项目
git clone https://github.com/your-org/compMOS.git

# 进入项目目录
cd compMOS

# 切换到开发分支
git checkout develop
```

### 2.2 安装依赖

```bash
# 安装项目依赖（首次运行可能需要5-10分钟）
npm install

# 或使用yarn（如果团队使用yarn）
# yarn install
```

如果安装遇到问题，可以尝试：

```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 2.3 配置环境变量

项目使用环境变量管理不同环境的配置。

#### 开发环境配置

复制环境变量模板：

```bash
cp .env.example .env.development.local
```

编辑 `.env.development.local`：

```bash
# 应用基本信息
NODE_ENV=development
VUE_APP_TITLE=compMOS企业结算平台

# API地址
VUE_APP_API_BASE_URL=http://localhost:3000
VUE_APP_MOS_API_URL=https://api-test.example.com

# Mock服务
VUE_APP_ENABLE_MOCK=true

# Sentry（错误监控）
VUE_APP_SENTRY_DSN=

# 其他配置
VUE_APP_ENABLE_SOURCE_MAP=true
```

#### 生产环境配置

编辑 `config/prod.env.js`：

```javascript
module.exports = {
  NODE_ENV: '"production"',
  VUE_APP_API_BASE_URL: '"https://api.example.com"',
  VUE_APP_MOS_API_URL: '"https://api.example.com"',
  VUE_APP_ENABLE_MOCK: 'false',
  VUE_APP_SENTRY_DSN: '"your-sentry-dsn"',
  VUE_APP_CDN_URL: '"https://cdn.example.com/compmos/"'
};
```

---

## 3. 本地开发

### 3.1 启动开发服务器

```bash
# 启动开发服务器（包含Mock服务）
npm run dev

# 或者分别启动
npm run mock    # 启动Mock服务（端口3000）
npm run serve   # 启动开发服务器（端口8080）
```

启动成功后，浏览器会自动打开 `http://localhost:8080`

### 3.2 目录结构

```
compMOS/
├── src/                         # 源代码目录
│   ├── api/                     # API接口层
│   │   ├── bill/                # 账单API
│   │   ├── invoice/             # 发票API
│   │   └── user/                # 用户API
│   ├── assets/                  # 静态资源
│   │   ├── images/              # 图片
│   │   ├── icons/               # 图标
│   │   └── styles/              # 全局样式
│   ├── components/              # 组件
│   │   ├── common/              # 通用组件
│   │   ├── bill/                # 账单组件
│   │   └── invoice/             # 发票组件
│   ├── views/                   # 页面组件
│   │   ├── login/               # 登录页
│   │   ├── bill/                # 账单页面
│   │   └── invoice/             # 发票页面
│   ├── router/                  # 路由配置
│   ├── store/                   # Vuex状态管理
│   │   └── modules/             # Store模块
│   ├── utils/                   # 工具函数
│   ├── mixins/                  # Vue混入
│   ├── filters/                 # Vue过滤器
│   ├── directives/              # Vue指令
│   ├── App.vue                  # 根组件
│   └── main.js                  # 入口文件
├── public/                      # 公共资源
├── tests/                       # 测试目录
│   ├── unit/                    # 单元测试
│   ├── integration/             # 集成测试
│   └── e2e/                     # E2E测试
├── build/                       # 构建配置
├── config/                      # 项目配置
├── mock/                        # Mock数据
│   ├── data/                    # Mock数据文件
│   ├── mock.js                  # Mock.js配置
│   └── server.js                # json-server配置
├── .eslintrc.js                 # ESLint配置
├── .prettierrc.js               # Prettier配置
├── package.json                 # 项目依赖
└── README.md                    # 项目说明
```

### 3.3 开发流程

#### 3.3.1 创建新功能分支

```bash
# 基于develop分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

#### 3.3.2 开发新页面

**示例：创建账单列表页面**

1. **创建Vue组件** (`src/views/bill/List.vue`):

```vue
<template>
  <div class="bill-list-page">
    <page-header title="账单管理" />
    
    <el-card>
      <search-bar @search="handleSearch" />
      
      <el-table :data="billList" v-loading="loading">
        <el-table-column prop="billNo" label="账单编号" />
        <el-table-column prop="billCycle" label="账单周期" />
        <el-table-column prop="totalAmount" label="总金额" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="viewDetail(scope.row)" type="text">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'BillList',
  data() {
    return {
      loading: false,
      currentPage: 1,
      pageSize: 20
    };
  },
  computed: {
    ...mapState('bill', ['billList', 'total'])
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    ...mapActions('bill', ['fetchBillPackages']),
    
    async fetchData() {
      this.loading = true;
      try {
        await this.fetchBillPackages({
          pageNum: this.currentPage,
          pageSize: this.pageSize
        });
      } catch (error) {
        this.$message.error('获取账单列表失败：' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    handleSearch(filters) {
      this.currentPage = 1;
      this.fetchData();
    },
    
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchData();
    },
    
    viewDetail(row) {
      this.$router.push(`/bill/detail/${row.billNo}`);
    }
  }
};
</script>

<style lang="less" scoped>
.bill-list-page {
  padding: 20px;
}
</style>
```

2. **创建API接口** (`src/api/bill/index.js`):

```javascript
import http from '@/http/request';

/**
 * 获取账单包列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getBillPackages(params) {
  return http.get('/api/bills', { params });
}

/**
 * 获取账单详情
 * @param {String} billNo - 账单编号
 * @returns {Promise}
 */
export function getBillDetail(billNo) {
  return http.get(`/api/bills/${billNo}`);
}

/**
 * 确认账单
 * @param {String} billNo - 账单编号
 * @returns {Promise}
 */
export function confirmBill(billNo) {
  return http.post(`/api/bills/${billNo}/confirm`);
}
```

3. **创建Vuex Store模块** (`src/store/modules/bill.js`):

```javascript
import * as billApi from '@/api/bill';

const state = {
  billList: [],
  total: 0,
  currentBill: null
};

const mutations = {
  SET_BILL_LIST(state, { list, total }) {
    state.billList = list;
    state.total = total;
  },
  SET_CURRENT_BILL(state, bill) {
    state.currentBill = bill;
  }
};

const actions = {
  async fetchBillPackages({ commit }, params) {
    const { data } = await billApi.getBillPackages(params);
    commit('SET_BILL_LIST', {
      list: data.list,
      total: data.total
    });
  },
  
  async fetchBillDetail({ commit }, billNo) {
    const { data } = await billApi.getBillDetail(billNo);
    commit('SET_CURRENT_BILL', data);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
```

4. **配置路由** (`src/router/routes.js`):

```javascript
const routes = [
  {
    path: '/bill',
    name: 'Bill',
    component: () => import('@/views/bill/List.vue'),
    meta: {
      title: '账单管理',
      permission: 'bill:view'
    }
  },
  {
    path: '/bill/detail/:billNo',
    name: 'BillDetail',
    component: () => import('@/views/bill/Detail.vue'),
    meta: {
      title: '账单详情',
      permission: 'bill:view'
    }
  }
];
```

#### 3.3.3 配置Mock数据

**Mock.js示例** (`mock/mock.js`):

```javascript
import Mock from 'mockjs';

if (process.env.VUE_APP_ENABLE_MOCK === 'true') {
  // 账单列表
  Mock.mock('/api/bills', 'get', {
    status: '00000',
    message: '成功',
    data: {
      'list|10': [{
        'billNo': '@id',
        'billCycle': '2026-01',
        'billStatus': '@integer(0, 3)',
        'totalAmount': '@float(10000, 100000, 2, 2)',
        'totalOrderCount': '@integer(10, 100)',
        'createTime': '@datetime'
      }],
      'total': 100
    }
  });
}
```

**json-server示例** (`mock/data/db.json`):

```json
{
  "bills": [
    {
      "billNo": "BILL202601001",
      "billCycle": "2026-01",
      "billStatus": 0,
      "totalAmount": 125000.50,
      "totalOrderCount": 45,
      "createTime": "2026-01-01T00:00:00Z"
    }
  ],
  "orders": [],
  "invoices": []
}
```

### 3.4 热重载

开发服务器支持热重载（Hot Reload），修改代码后浏览器会自动刷新。

- Vue组件：自动热重载
- Vuex Store：自动热重载
- 路由配置：需要手动刷新浏览器
- 环境变量：需要重启开发服务器

---

## 4. 代码规范

### 4.1 ESLint检查

```bash
# 运行ESLint检查
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

### 4.2 Prettier格式化

```bash
# 格式化所有代码
npm run format

# 格式化特定文件
npx prettier --write src/views/bill/List.vue
```

### 4.3 VS Code配置

安装推荐扩展：

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Vetur**: Vue语法高亮和智能提示
- **GitLens**: Git增强工具

配置 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "vetur.validation.template": false
}
```

### 4.4 Git Commit规范

提交信息格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型**:
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建工具或辅助工具的变动

**示例**:

```bash
git commit -m "feat(bill): 添加账单列表页面"
git commit -m "fix(invoice): 修复发票下载链接错误"
git commit -m "docs(readme): 更新快速开始指南"
```

---

## 5. 测试

### 5.1 单元测试

使用Jest + Vue Test Utils进行单元测试。

```bash
# 运行所有单元测试
npm run test:unit

# 运行特定测试文件
npm run test:unit -- tests/unit/components/BillCard.spec.js

# 生成测试覆盖率报告
npm run test:unit:coverage
```

**单元测试示例** (`tests/unit/components/BillCard.spec.js`):

```javascript
import { shallowMount } from '@vue/test-utils';
import BillCard from '@/components/bill/BillCard.vue';

describe('BillCard.vue', () => {
  it('renders bill info correctly', () => {
    const billData = {
      billNo: 'BILL202601001',
      billCycle: '2026-01',
      totalAmount: 125000.50
    };
    
    const wrapper = shallowMount(BillCard, {
      propsData: { bill: billData }
    });
    
    expect(wrapper.text()).toContain('BILL202601001');
    expect(wrapper.text()).toContain('2026-01');
    expect(wrapper.text()).toContain('125,000.50');
  });
  
  it('emits view event when button clicked', async () => {
    const wrapper = shallowMount(BillCard, {
      propsData: { bill: { billNo: 'BILL202601001' } }
    });
    
    await wrapper.find('.view-button').trigger('click');
    
    expect(wrapper.emitted().view).toBeTruthy();
  });
});
```

### 5.2 E2E测试

使用Cypress进行端到端测试。

```bash
# 启动Cypress测试运行器（可视化界面）
npm run test:e2e

# 无头模式运行E2E测试
npm run test:e2e:headless
```

**E2E测试示例** (`tests/e2e/specs/bill-list.spec.js`):

```javascript
describe('Bill List Page', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.login('testuser@example.com', 'password');
  });
  
  it('displays bill list correctly', () => {
    cy.visit('/bill');
    cy.get('.bill-list-page').should('be.visible');
    cy.get('.el-table').should('be.visible');
    cy.get('.el-table tbody tr').should('have.length.greaterThan', 0);
  });
  
  it('can view bill detail', () => {
    cy.visit('/bill');
    cy.get('.el-table tbody tr').first().find('.view-button').click();
    cy.url().should('include', '/bill/detail/');
    cy.get('.bill-detail-page').should('be.visible');
  });
});
```

### 5.3 测试覆盖率

测试覆盖率目标：

- **Branches**: >= 70%
- **Functions**: >= 70%
- **Lines**: >= 70%
- **Statements**: >= 70%

查看覆盖率报告：

```bash
npm run test:unit:coverage
open coverage/lcov-report/index.html
```

---

## 6. 构建和部署

### 6.1 构建生产版本

```bash
# 构建生产版本
npm run build

# 构建输出目录：dist/
```

构建完成后，`dist/` 目录包含所有静态资源：

```
dist/
├── index.html
├── js/
│   ├── app.[hash].js
│   ├── vue-vendor.[hash].js
│   ├── element-ui.[hash].js
│   └── vendors.[hash].js
├── css/
│   └── app.[hash].css
└── images/
```

### 6.2 本地预览构建结果

```bash
# 安装http-server（首次）
npm install -g http-server

# 启动静态服务器
http-server dist -p 8080

# 访问 http://localhost:8080
```

### 6.3 部署到CDN

#### 方式1: 使用阿里云OSS部署脚本

```bash
# 设置环境变量
export OSS_REGION=oss-cn-hangzhou
export OSS_ACCESS_KEY_ID=your-access-key
export OSS_ACCESS_KEY_SECRET=your-secret-key
export OSS_BUCKET=your-bucket-name

# 执行部署
npm run deploy:oss
```

#### 方式2: 手动上传

1. 构建项目：`npm run build`
2. 登录阿里云OSS控制台
3. 上传 `dist/` 目录下的所有文件到OSS bucket
4. 配置CDN加速域名
5. 刷新CDN缓存（仅 `index.html`）

### 6.4 CI/CD集成

**GitHub Actions示例** (`.github/workflows/deploy.yml`):

```yaml
name: Build and Deploy

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '12'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm run test:unit
      
      - name: Build
        run: npm run build
      
      - name: Deploy to OSS
        run: npm run deploy:oss
        env:
          OSS_REGION: ${{ secrets.OSS_REGION }}
          OSS_ACCESS_KEY_ID: ${{ secrets.OSS_ACCESS_KEY_ID }}
          OSS_ACCESS_KEY_SECRET: ${{ secrets.OSS_ACCESS_KEY_SECRET }}
          OSS_BUCKET: ${{ secrets.OSS_BUCKET }}
```

---

## 7. 常见问题

### 7.1 npm install失败

**问题**: 安装依赖时出现网络错误或超时

**解决**:

```bash
# 使用淘宝npm镜像
npm config set registry https://registry.npmmirror.com

# 或使用cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

### 7.2 端口被占用

**问题**: 启动开发服务器时提示端口8080已被占用

**解决**:

```bash
# 方式1: 修改端口（config/index.js）
dev: {
  port: 8081
}

# 方式2: 杀掉占用端口的进程
lsof -i :8080
kill -9 <PID>
```

### 7.3 代码修改不生效

**问题**: 修改代码后浏览器没有自动刷新

**解决**:

1. 检查开发服务器是否正常运行
2. 检查浏览器控制台是否有错误
3. 尝试手动刷新浏览器（Cmd+R或Ctrl+R）
4. 重启开发服务器

### 7.4 Mock数据不生效

**问题**: Mock数据没有生效，请求返回404

**解决**:

1. 检查 `.env.development.local` 中 `VUE_APP_ENABLE_MOCK=true`
2. 确保Mock服务已启动：`npm run mock`
3. 检查Mock配置文件是否正确
4. 清除浏览器缓存后重试

### 7.5 ESLint报错

**问题**: ESLint报错导致无法启动或构建

**解决**:

```bash
# 自动修复可修复的问题
npm run lint:fix

# 临时禁用ESLint（不推荐）
# 在build/webpack.base.conf.js中注释掉eslint-loader
```

---

## 8. 资源链接

### 8.1 官方文档

- **Vue.js 2.x**: https://v2.vuejs.org/
- **Vuex**: https://vuex.vuejs.org/
- **Vue Router**: https://router.vuejs.org/
- **Element UI**: https://element.eleme.io/
- **Axios**: https://axios-http.com/

### 8.2 工具文档

- **Webpack 3.x**: https://v3.webpack.js.org/
- **Babel**: https://babeljs.io/
- **ESLint**: https://eslint.org/
- **Prettier**: https://prettier.io/
- **Jest**: https://jestjs.io/
- **Cypress**: https://www.cypress.io/

### 8.3 项目文档

- [Feature Specification](./spec.md): 功能规范文档
- [Implementation Plan](./plan.md): 实现计划
- [Research Decisions](./research.md): 技术研究和决策
- [Data Model](./data-model.md): 数据模型定义
- [API Contracts](./contracts/): API契约文档

### 8.4 团队协作

- **代码仓库**: https://github.com/your-org/compMOS
- **项目管理**: https://jira.example.com/projects/COMPMOS
- **API文档**: https://api-docs.example.com/compmos
- **设计稿**: https://figma.com/files/compmos

---

## 下一步

完成快速开始后，建议阅读以下文档：

1. **[Implementation Plan](./plan.md)**: 了解项目的整体技术方案
2. **[Data Model](./data-model.md)**: 理解前端数据模型设计
3. **[API Contracts](./contracts/)**: 熟悉API接口规范
4. **编码规范文档** (`.cursor/commands/speckit.constitution.md`): 掌握项目编码规范

祝开发顺利！🎉

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-15  
**Status**: ✅ Quickstart Guide Complete

