# 项目编码规范文档

## 1. 项目概述

本项目是一个基于 Vue.js 2.x 的自动化结算平台，主要用于企业的自动化结算。

## 2. 技术栈

### 2.1 核心框架
- **Vue.js**: 2.7.12
- **Vue Router**: 3.x
- **Vuex**: 3.1.2
- **Element UI**: 2.13.0
- **Axios**: 0.18.0

### 2.2 构建工具
- **Webpack**: 3.x
- **Babel**: 6.x
- **Less**: 3.9.0
- **ESLint**: 使用 @ekb-cli 规则
- **Stylelint**: 15.x
- **Prettier**: 配置见 `.prettierrc.js`

### 2.3 其他依赖
- **Lodash**: 4.17.14
- **Moment.js**: 2.25.1
- **Big.js**: 5.2.2 (用于精确数值计算)

## 3. 代码风格规范

### 3.1 Prettier 配置
```javascript
// .prettierrc.js
module.exports = {
  printWidth: 120,        // 行宽限制
  semi: true,             // 使用分号
  singleQuote: false,     // 使用双引号
  trailingComma: 'none',  // 不使用尾逗号
  arrowParens: 'always',  // 箭头函数始终使用括号
  tabWidth: 2,           // 缩进宽度
  useTabs: false,         // 使用空格缩进
  htmlWhitespaceSensitivity: 'ignore'
};
```

### 3.2 命名规范

#### 3.2.1 文件命名
- **Vue 组件**: 使用 PascalCase，如 `InvoiceList.vue`, `ManualRefundNew.vue`
- **JavaScript 文件**: 使用 camelCase，如 `mixinCustomer.js`, `api-config.js`
- **样式文件**: 使用 kebab-case，如 `CustomerList.less`

#### 3.2.2 组件命名
```javascript
// 组件名使用 PascalCase
export default {
  name: "ManualRefundNew",
  // ...
}
```

#### 3.2.3 变量和函数命名
```javascript
// 变量和函数使用 camelCase
const userInfo = {};
const getUserInfo = () => {};

// 常量使用 UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 1024;
const API_BASE_URL = 'https://api.example.com';

// 枚举使用 UPPER_SNAKE_CASE
const ORDER_STATUS = {
  PENDING: 1,
  COMPLETED: 2,
  CANCELLED: 3
};
```

### 3.3 Vue 组件结构规范

#### 3.3.1 组件文件结构
```vue
<template>
  <!-- 模板内容 -->
</template>

<script>
// 导入语句
import ComponentA from './ComponentA.vue';
import { apiFunction } from '@/api/module';

// 导出默认配置
export default {
  name: 'ComponentName',
  components: {
    ComponentA
  },
  mixins: [],
  props: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
};
</script>

<style lang="less" scoped>
/* 样式内容 */
</style>
```

#### 3.3.2 Props 定义
```javascript
props: {
  // 简单类型
  title: {
    type: String,
    default: ''
  },
  // 复杂类型
  userInfo: {
    type: Object,
    default: () => ({})
  },
  // 必填属性
  orderId: {
    type: [String, Number],
    required: true
  },
  // 自定义验证
  businessType: {
    type: Number,
    validator(value) {
      return value in BizTypeMap;
    }
  }
}
```

### 3.4 API 调用规范

#### 3.4.1 API 文件结构
```javascript
// api/module/api.js
import http from "@/http/request.js";

export const functionName = (params) => {
  return http.get(["module", "/endpoint"], params);
};

export const postFunction = (params) => {
  return http.post(["module", "/endpoint"], {}, params);
};
```

#### 3.4.2 API 调用方式
```javascript
// 在组件中使用
import { functionName, postFunction } from "@/api/module/api.js";

export default {
  methods: {
    async fetchData() {
      try {
        const res = await functionName({ id: 123 });
        if (res.status === "00000") {
          this.data = res.data;
        }
      } catch (error) {
        this.$message.error("获取数据失败");
      }
    }
  }
};
```

### 3.5 状态管理规范

#### 3.5.1 Store 结构
```javascript
// store/modules/module.js
const state = {
  listData: [],
  loading: false
};

const mutations = {
  SET_LIST_DATA(state, data) {
    state.listData = data;
  },
  SET_LOADING(state, status) {
    state.loading = status;
  }
};

const actions = {
  async fetchData({ commit }, params) {
    commit('SET_LOADING', true);
    try {
      const res = await apiFunction(params);
      if (res.status === "00000") {
        commit('SET_LIST_DATA', res.data);
      }
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

const getters = {
  filteredList: state => state.listData.filter(item => item.active)
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
```

### 3.6 样式规范

#### 3.6.1 Less 变量
```less
// 使用项目统一的颜色变量
@primary-color: rgb(37, 85, 255);
@success-color: #67c23a;
@warning-color: #e6a23c;
@danger-color: #f56c6c;
@info-color: #909399;

// 间距变量
@spacing-xs: 4px;
@spacing-sm: 8px;
@spacing-md: 16px;
@spacing-lg: 24px;
@spacing-xl: 32px;
```

#### 3.6.2 类名规范
```less
// 使用 BEM 命名规范
.component-name {
  &__element {
    // 元素样式
  }
  
  &--modifier {
    // 修饰符样式
  }
}

// 功能性类名
.text-center { text-align: center; }
.mb-20 { margin-bottom: 20px; }
.flex { display: flex; }
.flex-1 { flex: 1; }
```

### 3.7 工具函数规范

#### 3.7.1 格式化函数
```javascript
// utils/format.js
export const formatPositiveNumber = (value) => {
  return value > 0 ? value : "-";
};

export const formatDate = (timestamp, format = "YYYY-MM-DD") => {
  return moment(timestamp).format(format);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount);
};
```

#### 3.7.2 验证函数
```javascript
// utils/validate.js
export const isIDNumber = (id) => {
  // 身份证号验证逻辑
  return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(id);
};

export const isPhoneNumber = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone);
};
```

## 4. 项目结构规范

### 4.1 目录结构
```
src/
├── api/                    # API 接口
│   ├── module/            # 按模块划分的 API
├── assets/                # 静态资源
├── components/            # 公共组件
│   ├── elem/             # Element UI 扩展组件
│   └── module/           # 业务组件
├── http/                  # HTTP 请求配置
├── router/                # 路由配置
├── store/                 # Vuex 状态管理
│   └── modules/          # 按模块划分的 store
├── utils/                 # 工具函数
├── views/                 # 页面组件
│   └── Sys/              # 系统模块页面
│       └── Module/       # 具体模块
└── mixins/                # 混入
```

### 4.2 组件分类
- **页面组件**: 放在 `views/` 目录下，每个页面一个文件夹
- **业务组件**: 放在 `components/` 目录下，按业务模块分类
- **通用组件**: 放在 `components/elem/` 目录下，可复用的基础组件

## 5. 常见代码模式

### 5.1 表格组件模式
```vue
<template>
  <el-table :data="tableData" v-loading="loading">
    <el-table-column
      v-for="item in tableColumns"
      :key="item.prop"
      :prop="item.prop"
      :label="item.label"
      :width="item.width"
    >
      <template slot-scope="scope">
        <span v-if="item.formatter">
          {{ item.formatter(scope.row, item, scope.row[item.prop]) }}
        </span>
        <span v-else>{{ scope.row[item.prop] }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  data() {
    return {
      tableData: [],
      tableColumns: [
        { prop: 'name', label: '名称' },
        { prop: 'date', label: '日期', formatter: this.formatDate }
      ],
      loading: false
    };
  },
  methods: {
    formatDate(row, column, cellValue) {
      return moment(cellValue).format('YYYY-MM-DD');
    }
  }
};
</script>
```

### 5.2 表单验证模式
```javascript
data() {
  return {
    form: {
      name: '',
      email: ''
    },
    rules: {
      name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ]
    }
  };
},
methods: {
  submitForm() {
    this.$refs.form.validate(valid => {
      if (valid) {
        // 提交逻辑
      }
    });
  }
}
```

### 5.3 数值处理模式
```javascript
// 使用 Big.js 处理精确数值计算
import Big from 'big.js';

methods: {
  calculateTotal() {
    const price = new Big(this.price);
    const quantity = new Big(this.quantity);
    const discount = new Big(this.discount);
    
    this.total = price.times(quantity).minus(discount).toNumber();
  }
}
```

## 6. 性能优化建议

### 6.1 组件懒加载
```javascript
components: {
  HeavyComponent: () => import('./HeavyComponent.vue')
}
```

### 6.2 列表优化
```vue
<template>
  <el-table :data="tableData" row-key="id">
    <!-- 使用 row-key 提高性能 -->
  </el-table>
</template>
```

### 6.3 防抖和节流
```javascript
import { debounce, throttle } from 'lodash';

methods: {
  search: debounce(function(query) {
    // 搜索逻辑
  }, 300),
  
  scrollHandler: throttle(function() {
    // 滚动处理逻辑
  }, 100)
}
```

## 7. 错误处理规范

### 7.1 API 错误处理
```javascript
async fetchData() {
  try {
    this.loading = true;
    const res = await apiFunction(params);
    if (res.status === "00000") {
      this.data = res.data;
    } else {
      this.$message.error(res.msg || '请求失败');
    }
  } catch (error) {
    console.error('API请求错误:', error);
    this.$message.error('网络错误，请稍后重试');
  } finally {
    this.loading = false;
  }
}
```

### 7.2 表单验证错误处理
```javascript
submitForm() {
  this.$refs.form.validate(valid => {
    if (!valid) {
      this.$message.warning('请检查表单填写是否正确');
      return;
    }
    // 提交逻辑
  });
}
```

## 8. 注释规范

### 8.1 文件头注释
```javascript
/*
 * @Author: 作者名
 * @Date: 创建日期
 * @LastEditTime: 最后修改时间
 * @FilePath: 文件路径
 * @Description: 文件描述
 */
```

### 8.2 函数注释
```javascript
/**
 * 格式化数字显示
 * @param {number} value - 需要格式化的数字
 * @param {string} [placeholder='-'] - 当数字无效时的占位符
 * @returns {string|number} 格式化后的结果
 */
export const formatPositiveNumber = (value, placeholder = '-') => {
  return value > 0 ? value : placeholder;
};
```

### 8.3 复杂逻辑注释
```javascript
// 计算退款金额，需要考虑各种优惠和折扣
const calculateRefundAmount = () => {
  // 基础价格减去活动优惠
  const baseAmount = new Big(originalPrice).minus(activityDiscount);
  
  // 再减去红包金额
  const finalAmount = baseAmount.minus(redPacketAmount);
  
  return finalAmount.toNumber();
};
```

## 9. Git 提交规范

### 9.1 提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 9.2 Type 类型
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 9.3 示例
```
feat(invoice): 添加发票批量下载功能

- 支持多种格式导出
- 添加下载进度提示
- 优化大文件下载性能

Closes #123
```

## 10. 代码审查清单

### 10.1 功能性检查
- [ ] 功能是否按需求实现
- [ ] 边界条件是否处理
- [ ] 错误处理是否完善
- [ ] 性能是否满足要求

### 10.2 代码质量检查
- [ ] 命名是否规范
- [ ] 代码结构是否清晰
- [ ] 是否有重复代码
- [ ] 注释是否充分

### 10.3 安全性检查
- [ ] 输入验证是否充分
- [ ] 敏感信息是否泄露
- [ ] API 调用是否安全

## 11. 常见问题与解决方案

### 11.1 数值精度问题
```javascript
// 错误做法
const result = 0.1 + 0.2; // 0.30000000000000004

// 正确做法
import Big from 'big.js';
const result = new Big(0.1).plus(0.2).toNumber(); // 0.3
```

### 11.2 异步操作处理
```javascript
// 错误做法
async fetchData() {
  const res = await apiFunction();
  this.data = res.data; // 没有错误处理
}

// 正确做法
async fetchData() {
  try {
    const res = await apiFunction();
    if (res.status === "00000") {
      this.data = res.data;
    } else {
      this.$message.error(res.msg);
    }
  } catch (error) {
    this.$message.error('请求失败');
  }
}
```

### 11.3 组件通信
```javascript
// 父子组件通信
// 父组件
<ChildComponent :value="parentValue" @input="handleChildInput" />

// 子组件
this.$emit('input', newValue);

// 兄弟组件通信使用事件总线或 Vuex
```

## 12. 总结

本编码规范文档旨在提高项目代码质量、可维护性和团队协作效率。所有开发人员应遵循这些规范，并在代码审查过程中严格执行。规范会随着项目发展不断更新和完善。