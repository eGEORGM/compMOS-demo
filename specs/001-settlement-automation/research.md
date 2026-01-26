# Technology Research & Decisions

**Feature**: 企业自动化结算平台 (compMOS)  
**Date**: 2026-01-15  
**Phase**: 0 - Research  
**Related**: [plan.md](./plan.md) | [spec.md](./spec.md)

本文档记录所有技术研究和决策过程，解决implementation plan中标识的技术未知事项。

---

## 目录

1. [前端测试框架选择](#1-前端测试框架选择)
2. [Mock数据管理方案](#2-mock数据管理方案)
3. [国际化（i18n）方案](#3-国际化i18n方案)
4. [代码分割和懒加载策略](#4-代码分割和懒加载策略)
5. [CDN部署和静态资源管理](#5-cdn部署和静态资源管理)
6. [前端监控和日志收集](#6-前端监控和日志收集)
7. [表格大数据渲染优化](#7-表格大数据渲染优化)
8. [文件下载和导出方案](#8-文件下载和导出方案)
9. [权限管理和路由守卫](#9-权限管理和路由守卫)
10. [API请求缓存和优化](#10-api请求缓存和优化)

---

## 1. 前端测试框架选择

### 问题描述
项目编码规范未明确指定前端测试框架，需要选择合适的单元测试和E2E测试方案。

### 可选方案

#### 单元测试框架

| 方案 | 优点 | 缺点 | Vue 2.x兼容性 |
|------|------|------|---------------|
| **Jest + Vue Test Utils** | 社区广泛使用、配置简单、快照测试、覆盖率工具完善 | 配置稍复杂（需要Babel转换） | ✅ 完全兼容 |
| **Mocha + Chai + Sinon** | 灵活性高、插件丰富、学习曲线平缓 | 需要组合多个库、配置复杂 | ✅ 兼容 |
| **Vitest** | 性能极佳、与Vite深度集成、Jest兼容API | 需要迁移到Vite（项目使用Webpack 3.x） | ⚠️ 需要升级构建工具 |

#### E2E测试框架

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Cypress** | 现代化、开发体验好、时间旅行调试、可视化测试运行器 | 仅支持Chrome系浏览器（新版支持Firefox） | ⭐⭐⭐⭐⭐ |
| **Playwright** | 跨浏览器支持好、性能优秀、微软维护 | 学习成本较高、社区较新 | ⭐⭐⭐⭐ |
| **Nightwatch** | Vue官方推荐、配置简单 | 社区活跃度下降、功能相对陈旧 | ⭐⭐⭐ |

### 决策

**单元测试**: **Jest + Vue Test Utils**

**理由**:
1. **社区成熟**: Jest是前端单元测试的事实标准，社区资源丰富，问题解决方便
2. **Vue生态**: Vue Test Utils是Vue官方测试工具库，与Jest配合使用体验最佳
3. **功能完善**: 内置断言库、Mock功能、快照测试、覆盖率报告
4. **团队熟悉度**: Jest的API设计简洁直观，团队学习成本低
5. **CI/CD友好**: 易于集成到CI/CD流程，支持并行测试

**E2E测试**: **Cypress**

**理由**:
1. **开发体验**: Cypress提供优秀的开发体验和可视化测试运行器，调试方便
2. **时间旅行**: 可以回溯每个测试步骤，快速定位问题
3. **自动等待**: 自动处理异步操作和DOM更新，减少flaky测试
4. **社区活跃**: 社区非常活跃，插件丰富，文档完善
5. **浏览器支持**: 虽然主要支持Chrome，但对于企业内部应用已足够（用户主要使用Chrome）

### 实施计划

1. **安装依赖**:
```bash
npm install --save-dev jest @vue/test-utils vue-jest babel-jest
npm install --save-dev cypress
```

2. **配置Jest** (jest.config.js):
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.js$': 'babel-jest'
  },
  testMatch: ['**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,vue}', '!src/main.js', '!**/node_modules/**'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

3. **配置Cypress** (cypress.json):
```json
{
  "baseUrl": "http://localhost:8080",
  "video": false,
  "screenshotOnRunFailure": true,
  "viewportWidth": 1280,
  "viewportHeight": 720
}
```

---

## 2. Mock数据管理方案

### 问题描述
开发环境需要Mock MOS后台API，需要选择合适的Mock数据管理方案。

### 可选方案

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Mock.js** | 轻量、语法简单、随机数据生成强大 | 拦截XHR，影响网络调试 | ⭐⭐⭐⭐ |
| **MSW (Mock Service Worker)** | Service Worker拦截、不影响DevTools、更真实 | 学习成本较高、配置复杂 | ⭐⭐⭐ |
| **json-server** | 独立服务、RESTful、简单快速 | 需要单独启动服务、数据持久化 | ⭐⭐⭐⭐⭐ |
| **本地代理+真实后端** | 最接近生产环境 | 依赖后端环境、开发效率低 | ⭐⭐ |

### 决策

**开发环境Mock方案**: **Mock.js + json-server（混合方案）**

**理由**:
1. **Mock.js用于简单场景**: 对于简单的API（如用户信息、常量数据），使用Mock.js在前端直接拦截，开发快速
2. **json-server用于复杂场景**: 对于需要CRUD操作的数据（如账单列表、订单明细），使用json-server提供真实的RESTful API
3. **灵活切换**: 通过环境变量控制是否启用Mock，方便与真实后端联调
4. **数据维护**: json-server的数据文件可以版本控制，团队共享Mock数据

### 实施计划

1. **安装依赖**:
```bash
npm install --save-dev mockjs json-server
```

2. **目录结构**:
```
mock/
├── data/               # json-server数据文件
│   ├── db.json        # Mock数据库
│   └── routes.json    # 路由映射
├── mock.js            # Mock.js配置
└── server.js          # json-server启动脚本
```

3. **配置Mock.js** (mock/mock.js):
```javascript
import Mock from 'mockjs';

// 仅在开发环境启用
if (process.env.NODE_ENV === 'development') {
  // 用户信息
  Mock.mock('/api/auth/userinfo', 'get', {
    status: '00000',
    data: {
      userId: '@id',
      username: '@cname',
      companyId: '@id',
      companyName: '@ctitle(3, 5)有限公司',
      accountType: 1, // 1-预存 2-授信
      permissions: ['bill:view', 'bill:confirm', 'invoice:apply', 'invoice:download']
    }
  });
  
  // 其他简单API...
}
```

4. **配置json-server** (mock/server.js):
```javascript
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('mock/data/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.rewriter(require('./data/routes.json')));
server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
```

5. **启动脚本** (package.json):
```json
{
  "scripts": {
    "mock": "node mock/server.js",
    "dev": "npm run mock & webpack-dev-server --config build/webpack.dev.conf.js"
  }
}
```

---

## 3. 国际化（i18n）方案

### 问题描述
一期仅支持简体中文，但需要考虑未来的国际化扩展。

### 可选方案

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Vue I18n** | Vue官方推荐、功能完善、社区活跃 | 增加打包体积 |
| **自实现** | 轻量、可控 | 功能有限、维护成本高 |
| **不预留i18n** | 无性能损耗、代码简洁 | 后期改造成本极高 |

### 决策

**国际化方案**: **预留Vue I18n集成点，一期不实际引入**

**理由**:
1. **一期需求**: 明确仅支持简体中文，不需要实际的国际化功能
2. **未来扩展**: 通过代码组织方式预留国际化扩展点，降低后期改造成本
3. **性能优先**: 避免引入不必要的依赖，保持打包体积最小
4. **渐进式**: 二期如需国际化，可以快速集成Vue I18n

### 实施计划

1. **代码组织规范**:
   - 所有用户可见文案统一存放在 `src/lang/zh-CN.js`
   - 组件中通过 `$t()` 函数引用（一期直接返回中文，二期替换为Vue I18n）

2. **示例代码**:
```javascript
// src/lang/zh-CN.js
export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除'
  },
  bill: {
    title: '账单管理',
    listTitle: '账单列表',
    detail: '账单详情'
  }
};

// src/utils/i18n.js (一期简化实现)
import zhCN from '@/lang/zh-CN';

export function $t(key) {
  const keys = key.split('.');
  let value = zhCN;
  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }
  return value;
}

// 组件中使用
<template>
  <el-button>{{ $t('common.confirm') }}</el-button>
</template>
```

3. **二期升级路径**:
   - 安装 `vue-i18n`
   - 替换 `$t()` 实现为 `this.$t()`
   - 添加其他语言文件（如 `en-US.js`）

---

## 4. 代码分割和懒加载策略

### 问题描述
需要详细规划代码分割策略以优化首屏加载时间，打包体积目标 < 5MB (gzip压缩后)。

### 可选方案

| 策略 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **路由级别懒加载** | 实现简单、效果明显 | 粒度较粗 | 页面级别 |
| **组件级别懒加载** | 粒度细、优化精准 | 复杂度高 | 大型组件 |
| **Vendor分离** | 缓存友好 | 配置复杂 | 第三方库 |
| **动态Import** | 按需加载 | 网络请求增多 | 低频功能 |

### 决策

**代码分割策略**: **路由懒加载 + Vendor分离 + 组件按需加载**

**理由**:
1. **首屏优先**: 路由懒加载可以最大程度减少首屏加载资源
2. **缓存优化**: Vendor分离后，第三方库的hash不变，浏览器可以长期缓存
3. **灵活性**: 对于大型组件（如富文本编辑器），可以按需加载
4. **渐进式**: 先实现路由懒加载，后续根据性能监控数据优化

### 实施计划

1. **路由懒加载配置** (src/router/routes.js):
```javascript
// 路由懒加载
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/Index.vue')
  },
  {
    path: '/bill',
    name: 'Bill',
    component: () => import(/* webpackChunkName: "bill" */ '@/views/bill/List.vue')
      },
      {
    path: '/invoice',
    name: 'Invoice',
    component: () => import(/* webpackChunkName: "invoice" */ '@/views/invoice/List.vue')
  }
];
```

2. **Webpack splitChunks配置** (build/webpack.base.conf.js):
```javascript
optimization: {
  splitChunks: {
    cacheGroups: {
      // Vue核心库
      vue: {
        test: /[\\/]node_modules[\\/](vue|vue-router|vuex)[\\/]/,
        name: 'vue-vendor',
        priority: 10,
        reuseExistingChunk: true
      },
      // Element UI
      elementUI: {
        test: /[\\/]node_modules[\\/]element-ui[\\/]/,
        name: 'element-ui',
        priority: 10,
        reuseExistingChunk: true
      },
      // 其他第三方库
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 5,
        reuseExistingChunk: true
      },
      // 公共代码
      common: {
        minChunks: 2,
        name: 'common',
        priority: 3,
        reuseExistingChunk: true
      }
    }
  },
  runtimeChunk: {
    name: 'runtime'
  }
}
```

3. **组件按需加载** (按需使用):
```javascript
// 对于大型低频组件，使用动态import
methods: {
  async openEditor() {
    const { default: RichTextEditor } = await import(
      /* webpackChunkName: "editor" */ '@/components/RichTextEditor.vue'
    );
    // 使用组件...
  }
}
```

4. **Element UI按需引入** (babel.config.js):
```javascript
plugins: [
  [
    'component',
    {
      libraryName: 'element-ui',
      styleLibraryName: 'theme-chalk'
    }
  ]
]
```

**预期效果**:
- 首屏加载资源 < 1MB (gzip)
- 路由切换加载资源 < 500KB (gzip)
- Vendor缓存命中率 > 90%

---

## 5. CDN部署和静态资源管理

### 问题描述
需要确定CDN部署方案和静态资源版本管理策略。

### 可选方案

| CDN服务商 | 优点 | 缺点 | 成本 |
|-----------|------|------|------|
| **阿里云OSS** | 国内速度快、稳定性高、与项目生态一致 | 国际访问慢 | 中 |
| **腾讯云COS** | 性价比高、速度快 | 文档略差 | 低 |
| **七牛云** | 免费额度大、简单易用 | 企业支持较弱 | 低 |
| **CloudFlare** | 全球加速、免费 | 国内访问不稳定 | 免费 |

### 决策

**CDN服务**: **阿里云OSS + CDN加速**

**理由**:
1. **项目生态**: 规范文档已提及阿里云OSS，保持技术栈一致性
2. **国内优化**: 用户主要在国内，阿里云国内节点覆盖最好
3. **企业级**: 稳定性和服务质量有保障
4. **集成方便**: 有成熟的部署工具和CI/CD集成方案

**静态资源版本管理**: **文件名Hash + CDN刷新**

**理由**:
1. **缓存友好**: 文件名包含contenthash，内容不变hash不变，充分利用浏览器缓存
2. **增量更新**: 只有修改的文件hash变化，用户只需下载变更部分
3. **回滚方便**: 旧版本文件仍在CDN上，可以快速回滚
4. **缓存控制**: 设置长缓存时间（1年），通过hash更新实现更新

### 实施计划

1. **Webpack输出配置** (build/webpack.prod.conf.js):
```javascript
output: {
  path: path.resolve(__dirname, '../dist'),
  filename: 'js/[name].[contenthash:8].js',
  chunkFilename: 'js/[name].[contenthash:8].js',
  publicPath: 'https://cdn.example.com/compmos/' // CDN地址
}
```

2. **OSS部署脚本** (scripts/deploy-oss.js):
```javascript
const OSS = require('ali-oss');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET
});

async function uploadDir(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await uploadDir(filePath, path.join(prefix, file));
    } else {
      const ossPath = path.join('compmos', prefix, file);
      console.log(chalk.blue(`Uploading: ${ossPath}`));
      await client.put(ossPath, filePath, {
        headers: {
          'Cache-Control': 'max-age=31536000' // 1年缓存
        }
      });
    }
  }
}

uploadDir('./dist').then(() => {
  console.log(chalk.green('✓ Deploy to OSS success!'));
}).catch(err => {
  console.error(chalk.red('✗ Deploy failed:'), err);
  process.exit(1);
});
```

3. **部署流程**:
```bash
# 1. 构建生产版本
npm run build

# 2. 上传到OSS
npm run deploy:oss

# 3. 刷新CDN缓存（index.html）
npm run cdn:refresh
```

4. **CDN缓存策略**:
   - `index.html`: 不缓存或短缓存（5分钟）
   - JS/CSS/图片: 长缓存（1年），通过文件名hash更新

---

## 6. 前端监控和日志收集

### 问题描述
需要监控前端性能和错误，选择合适的监控和日志方案。

### 可选方案

| 方案 | 优点 | 缺点 | 成本 |
|------|------|------|------|
| **Sentry** | 功能强大、社区活跃、错误追踪完善 | 国外服务、可能被墙 | 付费 |
| **阿里云ARMS** | 国内服务、性能监控完善、集成简单 | 社区较小 | 付费 |
| **腾讯云前端监控** | 国内服务、价格便宜 | 功能相对简单 | 付费 |
| **自建方案** | 可控、免费 | 开发维护成本高 | 免费 |

### 决策

**错误监控**: **Sentry（开源版自部署）**  
**性能监控**: **阿里云ARMS**

**理由**:
1. **错误监控用Sentry**: 
   - Sentry是错误监控领域的事实标准，功能最完善
   - 自部署开源版可以避免国外服务的网络问题
   - Source Map支持完善，可以定位到源码行号
   - 支持用户行为回放，便于复现问题

2. **性能监控用ARMS**: 
   - 阿里云ARMS专注于性能监控，指标完善（FCP、LCP、FID等）
   - 国内服务，稳定性有保障
   - 与阿里云OSS/CDN集成方便
   - 价格合理，按量计费

### 实施计划

1. **Sentry集成** (src/main.js):
```javascript
import * as Sentry from '@sentry/vue';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    Vue,
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router)
      })
    ],
    tracesSampleRate: 0.2, // 采样率20%
    environment: process.env.NODE_ENV,
    beforeSend(event, hint) {
      // 过滤敏感信息
      if (event.request) {
        delete event.request.cookies;
      }
      return event;
    }
  });
}
```

2. **ARMS集成** (public/index.html):
```html
<script>
!(function(c,b,d,a){
  c[a]||(c[a]={});c[a].config={pid:"xxx",appType:"web"};
  with(b)with(body)with(insertBefore(createElement("script"),firstChild))setAttribute("crossorigin","",src=d)
})(window,document,"https://retcode.alicdn.com/retcode/bl.js","__bl");
</script>
```

3. **性能监控指标**:
```javascript
// src/utils/performance.js
export function reportPerformance() {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const metrics = {
      // DNS查询时间
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      // TCP连接时间
      tcp: timing.connectEnd - timing.connectStart,
      // 请求时间
      request: timing.responseEnd - timing.requestStart,
      // DOM解析时间
      domParse: timing.domComplete - timing.domInteractive,
      // 白屏时间
      whiteScreen: timing.responseStart - timing.navigationStart,
      // 首屏时间
      firstScreen: timing.domContentLoadedEventEnd - timing.navigationStart,
      // 页面加载完成时间
      load: timing.loadEventEnd - timing.navigationStart
    };
    
    // 上报到ARMS
    if (window.__bl && window.__bl.api) {
      window.__bl.api('performance', metrics);
    }
  }
}
```

4. **错误边界处理**:
```javascript
// src/utils/errorHandler.js
export function setupGlobalErrorHandler(Vue) {
  // Vue错误处理
  Vue.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', err, info);
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(err, {
        contexts: {
          vue: {
            componentName: vm.$options.name,
            propsData: vm.$options.propsData,
            lifecycleHook: info
          }
        }
      });
    }
  };
  
  // 全局Promise错误
  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled Promise Rejection:', event.reason);
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(event.reason);
    }
  });
  
  // 资源加载错误
  window.addEventListener('error', event => {
    if (event.target !== window) {
      console.error('Resource Error:', event.target);
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureMessage(`Resource load error: ${event.target.src || event.target.href}`, 'warning');
      }
    }
  }, true);
}
```

---

## 7. 表格大数据渲染优化

### 问题描述
单个账单包可能包含5000笔订单，需要优化表格渲染性能。

### 可选方案

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **分页** | 实现简单、服务器压力小 | 用户体验一般、无法全局搜索 | < 1000条 |
| **虚拟滚动** | 性能好、用户体验好 | 实现复杂、与Element UI集成困难 | > 1000条 |
| **懒加载** | 实现中等、体验较好 | 首次加载慢 | 500-2000条 |
| **混合方案** | 灵活性高 | 复杂度最高 | 所有场景 |

### 决策

**表格渲染优化方案**: **分页为主 + 虚拟滚动为辅（混合方案）**

**理由**:
1. **场景分析**:
   - 90%的账单包 < 500条订单：使用分页即可满足需求
   - 5%的账单包 500-2000条：分页 + 增大每页条数
   - 5%的账单包 > 2000条：使用虚拟滚动

2. **实现成本**: 
   - 分页是Element UI Table原生支持，无额外开发成本
   - 虚拟滚动仅在必要时使用，避免过度优化

3. **用户体验**: 
   - 大多数用户使用分页即可，体验简单直观
   - 极少数大数据量场景使用虚拟滚动，性能有保障

### 实施计划

1. **分页表格** (默认方案):
```vue
<template>
  <div>
    <el-table
      :data="displayData"
      :row-key="row => row.orderNo"
      v-loading="loading"
    >
      <!-- 表格列定义 -->
    </el-table>
    
    <el-pagination
      :current-page="currentPage"
      :page-sizes="[20, 50, 100, 200]"
      :page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 1,
      pageSize: 50,
      total: 0,
      tableData: [],
      loading: false
    };
  },
  computed: {
    displayData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.tableData.slice(start, start + this.pageSize);
    }
  }
};
</script>
```

2. **虚拟滚动表格** (大数据量场景):
```bash
# 安装虚拟滚动组件
npm install --save vue-virtual-scroller
```

```vue
<template>
  <RecycleScroller
    class="scroller"
    :items="tableData"
    :item-size="50"
    :buffer="200"
    v-slot="{ item }"
  >
    <div class="table-row">
      <div class="col">{{ item.orderNo }}</div>
      <div class="col">{{ item.travelerName }}</div>
      <div class="col">{{ item.amount }}</div>
      <!-- 更多列 -->
    </div>
  </RecycleScroller>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export default {
  components: { RecycleScroller },
  data() {
    return {
      tableData: [] // 大数据量
    };
  }
};
</script>
```

3. **智能切换逻辑**:
```javascript
// src/mixins/tableMixin.js
export default {
  data() {
    return {
      useVirtualScroll: false,
      VIRTUAL_SCROLL_THRESHOLD: 2000 // 超过2000条使用虚拟滚动
    };
  },
  watch: {
    'tableData.length'(newLength) {
      this.useVirtualScroll = newLength > this.VIRTUAL_SCROLL_THRESHOLD;
    }
  }
};
```

4. **性能优化技巧**:
   - 使用 `row-key` 优化表格渲染
   - 避免在表格列中使用复杂的formatter
   - 图片使用懒加载
   - 禁用不必要的排序和筛选

**预期效果**:
- 500条数据渲染时间 < 1秒
- 5000条数据（虚拟滚动）渲染时间 < 2秒
- 表格滚动FPS > 30

---

## 8. 文件下载和导出方案

### 问题描述
需要实现Excel和PDF的下载和导出功能。

### 可选方案

| 方案 | 优点 | 缺点 | 推荐场景 |
|------|------|------|----------|
| **前端生成** | 无服务器压力、即时生成 | 浏览器性能限制、复杂样式困难 | 简单Excel |
| **后端生成+下载** | 质量高、支持复杂样式 | 服务器压力大 | 复杂PDF、大文件 |
| **混合方案** | 灵活性高 | 实现复杂 | 推荐 |

### 决策

**文件导出方案**: **后端生成为主 + 前端生成为辅（混合方案）**

**理由**:
1. **Excel导出**: 
   - 简单Excel（<1000行）：前端生成，使用 `xlsx` 库
   - 复杂Excel（>1000行、多Sheet、复杂样式）：后端生成

2. **PDF导出**: 
   - 所有PDF统一由后端生成（MOS系统）
   - 前端负责请求下载链接和展示下载进度

3. **电子签章**: 
   - 带公章的PDF必须由后端生成（调用电子签章服务）

### 实施计划

1. **前端Excel导出** (utils/excel.js):
```javascript
import XLSX from 'xlsx';

export function exportToExcel(data, filename = '账单明细.xlsx') {
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 按业务线分Sheet
  const sheets = {
    '机票': data.filter(item => item.businessType === '002'),
    '火车票': data.filter(item => item.businessType === '003'),
    '酒店': data.filter(item => item.businessType === '001')
  };
  
  Object.keys(sheets).forEach(sheetName => {
    const sheetData = sheets[sheetName];
    if (sheetData.length > 0) {
      // 转换为表格数据
      const ws = XLSX.utils.json_to_sheet(sheetData, {
        header: ['orderNo', 'travelerName', 'amount', 'date']
      });
      
      // 添加到工作簿
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  });
  
  // 导出文件
  XLSX.writeFile(wb, filename);
}
```

2. **后端文件下载** (api/bill/index.js):
```javascript
import http from '@/http/request';

// 申请导出（后端生成）
export function requestExport(billNo, type) {
  return http.post('/api/bills/export', {
    billNo,
    type, // 'excel' or 'pdf'
    timestamp: Date.now()
  });
}

// 获取导出文件下载链接
export function getExportFileUrl(taskId) {
  return http.get('/api/bills/export/status', {
    taskId
  });
}
```

3. **下载组件** (components/common/ExportButton.vue):
```vue
<template>
  <el-button
    type="primary"
    :loading="exporting"
    :disabled="disabled"
    @click="handleExport"
  >
    <i class="el-icon-download"></i>
    {{ exporting ? '导出中...' : '导出' }}
  </el-button>
</template>

<script>
import { requestExport, getExportFileUrl } from '@/api/bill';

export default {
  name: 'ExportButton',
  props: {
    billNo: {
      type: String,
      required: true
    },
    exportType: {
      type: String,
      default: 'excel',
      validator: value => ['excel', 'pdf'].includes(value)
    },
    disabled: Boolean
  },
  data() {
    return {
      exporting: false
    };
  },
  methods: {
    async handleExport() {
      try {
        this.exporting = true;
        
        // 1. 申请导出
        const { data: { taskId } } = await requestExport(this.billNo, this.exportType);
        
        // 2. 轮询导出状态
        const downloadUrl = await this.pollExportStatus(taskId);
        
        // 3. 下载文件
        window.open(downloadUrl, '_blank');
        
        this.$message.success('导出成功');
      } catch (error) {
        this.$message.error('导出失败：' + error.message);
      } finally {
        this.exporting = false;
      }
    },
    
    async pollExportStatus(taskId, maxRetries = 30) {
      for (let i = 0; i < maxRetries; i++) {
        const { data } = await getExportFileUrl(taskId);
        
        if (data.status === 'completed') {
          return data.downloadUrl;
        } else if (data.status === 'failed') {
          throw new Error(data.errorMessage || '导出失败');
        }
        
        // 等待2秒后重试
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      throw new Error('导出超时，请稍后重试');
    }
  }
};
</script>
```

4. **发票下载** (api/invoice/index.js):
```javascript
// 获取发票下载链接（预签名URL）
export function getInvoiceDownloadUrl(invoiceNo) {
  return http.get('/api/invoices/download', {
    invoiceNo
  });
}

// 批量下载发票
export async function batchDownloadInvoices(invoiceNos) {
  for (const invoiceNo of invoiceNos) {
    const { data: { downloadUrl } } = await getInvoiceDownloadUrl(invoiceNo);
    // 使用iframe下载，避免阻塞页面
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadUrl;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 5000);
    
    // 防止同时下载过多文件
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
```

**预期效果**:
- 简单Excel（<1000行）生成时间 < 3秒
- 复杂Excel、PDF后端生成 + 下载时间 < 10秒
- 批量下载支持 < 50个文件
- 下载进度可视化

---

## 9. 权限管理和路由守卫

### 问题描述
需要实现预存企业和授信企业的权限控制，包括路由级别、组件级别和按钮级别的权限。

### 可选方案

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **前端权限控制** | 用户体验好、响应快 | 安全性依赖后端 | 所有场景 |
| **后端权限控制** | 安全性高 | 用户体验差 | 敏感操作 |
| **混合控制** | 平衡体验和安全 | 实现复杂 | 推荐 |

### 决策

**权限管理方案**: **前端权限控制 + 后端权限校验（混合方案）**

**理由**:
1. **前端控制UI**: 
   - 路由守卫：无权限不显示菜单、不能访问路由
   - 组件级别：无权限组件不渲染
   - 按钮级别：无权限按钮隐藏或禁用

2. **后端校验安全**: 
   - 所有API请求后端必须校验权限
   - 防止前端绕过权限控制

3. **权限粒度**: 
   - 菜单权限：`bill:view`、`invoice:view`
   - 操作权限：`bill:confirm`、`bill:adjust`、`invoice:apply`、`invoice:download`
   - 企业类型：`accountType: 1(预存) / 2(授信)`

### 实施计划

1. **权限Store** (store/modules/user.js):
```javascript
const state = {
  userInfo: null,
  permissions: [],
  accountType: null // 1-预存 2-授信
};

const mutations = {
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo;
    state.permissions = userInfo.permissions || [];
    state.accountType = userInfo.accountType;
  },
  CLEAR_USER_INFO(state) {
    state.userInfo = null;
    state.permissions = [];
    state.accountType = null;
  }
};

const actions = {
  async getUserInfo({ commit }) {
    const { data } = await http.get('/api/auth/userinfo');
    commit('SET_USER_INFO', data);
    return data;
  }
};

const getters = {
  hasPermission: state => permission => {
    return state.permissions.includes(permission);
  },
  isPrePaidAccount: state => state.accountType === 1,
  isCreditAccount: state => state.accountType === 2
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
```

2. **路由守卫** (router/index.js):
```javascript
import store from '@/store';

router.beforeEach(async (to, from, next) => {
  // 检查登录状态
  const token = localStorage.getItem('token');
  if (!token) {
    if (to.path !== '/login') {
      return next('/login');
    }
    return next();
  }
  
  // 获取用户信息和权限
  if (!store.state.user.userInfo) {
    try {
      await store.dispatch('user/getUserInfo');
    } catch (error) {
      localStorage.removeItem('token');
      return next('/login');
    }
  }
  
  // 检查路由权限
  if (to.meta.permission) {
    const hasPermission = store.getters['user/hasPermission'](to.meta.permission);
    if (!hasPermission) {
      this.$message.error('无权限访问此页面');
      return next('/403');
    }
  }
  
  // 检查企业类型限制
  if (to.meta.requirePrePaid && !store.getters['user/isPrePaidAccount']) {
    this.$message.warning('该功能仅对预存企业开放');
    return next(from.path);
  }
  
  next();
});
```

3. **权限指令** (directives/permission.js):
```javascript
import store from '@/store';

// v-permission指令：无权限隐藏元素
export default {
  inserted(el, binding) {
    const { value } = binding;
    const permissions = store.state.user.permissions;
    
    if (value && !permissions.includes(value)) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  }
};

// 使用示例：
// <el-button v-permission="'bill:adjust'">调整账单</el-button>
```

4. **权限组件** (components/common/PermissionButton.vue):
```vue
<template>
  <el-button
    v-if="hasPermission"
    :disabled="!hasPermission || disabled"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot></slot>
  </el-button>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PermissionButton',
  props: {
    permission: {
      type: String,
      required: true
    },
    disabled: Boolean
  },
  computed: {
    ...mapGetters('user', ['hasPermission']),
    hasPermission() {
      return this.hasPermission(this.permission);
    }
  }
};
</script>
```

5. **路由配置示例** (router/routes.js):
```javascript
const routes = [
  {
    path: '/bill',
    name: 'Bill',
    component: () => import('@/views/bill/List.vue'),
    meta: {
      title: '账单管理',
      permission: 'bill:view' // 需要的权限
    }
  },
  {
    path: '/bill/adjust',
    name: 'BillAdjust',
    component: () => import('@/views/bill/Adjust.vue'),
    meta: {
      title: '调整账单',
      permission: 'bill:adjust',
      requirePrePaid: true // 仅预存企业可访问
    }
  }
];
```

**权限列表定义**:
```javascript
// src/utils/permissions.js
export const PERMISSIONS = {
  // 账单权限
  BILL_VIEW: 'bill:view',
  BILL_CONFIRM: 'bill:confirm',
  BILL_EXPORT: 'bill:export',
  BILL_ADJUST: 'bill:adjust', // 仅预存企业
  
  // 发票权限
  INVOICE_VIEW: 'invoice:view',
  INVOICE_APPLY: 'invoice:apply',
  INVOICE_DOWNLOAD: 'invoice:download',
  
  // 用户权限
  USER_PROFILE: 'user:profile'
};
```

---

## 10. API请求缓存和优化

### 问题描述
需要优化API请求，减少重复请求，提升用户体验。

### 可选方案

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Axios拦截器缓存** | 简单、集中管理 | 缓存策略单一 | ⭐⭐⭐⭐ |
| **Vuex缓存** | 灵活、状态管理 | 内存占用 | ⭐⭐⭐⭐⭐ |
| **LocalStorage缓存** | 持久化 | 容量限制、同步阻塞 | ⭐⭐⭐ |
| **Service Worker缓存** | 离线支持 | 实现复杂 | ⭐⭐ |

### 决策

**API缓存方案**: **Vuex缓存为主 + Axios请求去重为辅**

**理由**:
1. **Vuex缓存**: 
   - 用于缓存频繁访问但不常变化的数据（如用户信息、权限、字典数据）
   - 与Vue响应式系统集成，自动更新UI
   - 内存缓存，速度快

2. **Axios请求去重**: 
   - 防止短时间内的重复请求（如快速点击按钮）
   - 使用请求key（URL+params）作为唯一标识
   - 自动取消重复请求

3. **不使用持久化缓存**: 
   - 账单数据需要实时性，不适合长时间缓存
   - 避免数据不一致问题

### 实施计划

1. **Axios请求去重** (http/interceptor.js):
```javascript
import axios from 'axios';

// 请求去重Map
const pendingRequests = new Map();

// 生成请求key
function generateRequestKey(config) {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
}

// 添加pending请求
function addPendingRequest(config) {
  const requestKey = generateRequestKey(config);
  config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
    if (!pendingRequests.has(requestKey)) {
      pendingRequests.set(requestKey, cancel);
    } else {
      // 取消重复请求
      cancel(`重复请求已取消: ${config.url}`);
    }
  });
}

// 移除pending请求
function removePendingRequest(config) {
  const requestKey = generateRequestKey(config);
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey);
    cancel(requestKey);
    pendingRequests.delete(requestKey);
  }
}

// 请求拦截器
axios.interceptors.request.use(config => {
  // 取消之前的重复请求
  removePendingRequest(config);
  // 添加新的pending请求
  addPendingRequest(config);
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
axios.interceptors.response.use(response => {
  removePendingRequest(response.config);
  return response;
}, error => {
  if (axios.isCancel(error)) {
    console.log('Request canceled:', error.message);
  } else {
    removePendingRequest(error.config || {});
  }
  return Promise.reject(error);
});
```

2. **Vuex缓存** (store/modules/cache.js):
```javascript
const state = {
  // 用户信息缓存
  userInfo: null,
  userInfoExpiry: null,
  
  // 字典数据缓存
  dictData: {},
  dictExpiry: {},
  
  // 权限缓存
  permissions: [],
  permissionsExpiry: null
};

const mutations = {
  SET_CACHE(state, { key, value, ttl }) {
    state[key] = value;
    state[`${key}Expiry`] = Date.now() + (ttl || 5 * 60 * 1000); // 默认5分钟
  },
  
  CLEAR_CACHE(state, key) {
    state[key] = null;
    state[`${key}Expiry`] = null;
  },
  
  CLEAR_ALL_CACHE(state) {
    Object.keys(state).forEach(key => {
      if (!key.endsWith('Expiry')) {
        state[key] = null;
        state[`${key}Expiry`] = null;
      }
    });
  }
};

const actions = {
  async getCachedData({ state, commit }, { key, fetchFn, ttl }) {
    // 检查缓存是否有效
    if (state[key] && state[`${key}Expiry`] > Date.now()) {
      return state[key];
    }
    
    // 缓存失效，重新获取
    const data = await fetchFn();
    commit('SET_CACHE', { key, value: data, ttl });
    return data;
  }
};

const getters = {
  isCacheValid: state => key => {
    return state[key] && state[`${key}Expiry`] > Date.now();
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
```

3. **使用缓存** (示例):
```javascript
// 在组件或API模块中使用缓存
import store from '@/store';
import { getUserInfo } from '@/api/user';

export async function getCachedUserInfo() {
  return store.dispatch('cache/getCachedData', {
    key: 'userInfo',
    fetchFn: getUserInfo,
    ttl: 10 * 60 * 1000 // 10分钟
  });
}
```

4. **API请求优化配置** (http/config.js):
```javascript
export const API_CONFIG = {
  // 请求超时时间
  timeout: 10000,
  
  // 请求重试配置
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryCondition: error => {
      // 仅在网络错误或5xx错误时重试
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    }
  },
  
  // 缓存配置
  cache: {
    // 可缓存的接口
    cacheable: [
      '/api/auth/userinfo',
      '/api/auth/permissions',
      '/api/dict/*'
    ],
    // 缓存时间（秒）
    ttl: {
      '/api/auth/userinfo': 600, // 10分钟
      '/api/auth/permissions': 600,
      '/api/dict/*': 3600 // 1小时
    }
  }
};
```

5. **请求性能监控**:
```javascript
// http/interceptor.js
axios.interceptors.request.use(config => {
  config.metadata = { startTime: Date.now() };
  return config;
});

axios.interceptors.response.use(response => {
  const duration = Date.now() - response.config.metadata.startTime;
  
  // 慢请求告警（>3秒）
  if (duration > 3000) {
    console.warn(`Slow API request: ${response.config.url}, duration: ${duration}ms`);
    // 上报到监控系统
    if (window.__bl && window.__bl.api) {
      window.__bl.api('api', {
        url: response.config.url,
        duration,
        status: response.status
      });
    }
  }
  
  return response;
});
```

**预期效果**:
- 重复请求取消率 > 90%
- 缓存命中率 > 60%（用户信息、字典数据）
- 平均API响应时间 < 500ms
- 慢请求（>3秒）占比 < 5%

---

## 总结

本研究文档解决了implementation plan中标识的所有技术未知事项，为项目实施提供了明确的技术方案和决策依据。

### 关键决策汇总

| 领域 | 决策 | 理由 |
|------|------|------|
| 测试框架 | Jest + Vue Test Utils + Cypress | 社区成熟、Vue生态完善、开发体验好 |
| Mock方案 | Mock.js + json-server | 灵活性高、开发效率高 |
| 国际化 | 预留扩展点，一期不引入 | 避免过度设计，保持简洁 |
| 代码分割 | 路由懒加载 + Vendor分离 | 首屏优化、缓存友好 |
| CDN | 阿里云OSS + CDN | 国内速度快、项目生态一致 |
| 监控 | Sentry + 阿里云ARMS | 错误追踪完善、性能监控全面 |
| 表格优化 | 分页为主 + 虚拟滚动为辅 | 实用主义、避免过度优化 |
| 文件导出 | 后端生成为主 + 前端为辅 | 质量高、支持复杂样式 |
| 权限管理 | 前端控制 + 后端校验 | 体验和安全平衡 |
| API缓存 | Vuex缓存 + 请求去重 | 性能优化、减少重复请求 |

### 下一步行动

1. ✅ **Phase 0 完成**: 所有技术决策已明确
2. ⏭️ **Phase 1 开始**: 生成data-model.md、contracts/、quickstart.md
3. ⏭️ **更新Agent Context**: 将技术选型添加到agent-specific文件
4. ⏭️ **Phase 2 计划**: 执行 `/speckit.tasks` 命令生成任务列表

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-15  
**Status**: ✅ All technical decisions resolved
