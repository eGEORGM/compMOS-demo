# Technical Research: 开票流程优化

**Feature**: 005-invoice-flow-update  
**Date**: 2026-01-23  
**Status**: Completed

## 研究概述

本文档记录了开票流程优化所需的技术决策和最佳实践研究结果。

## 1. Vue Router 编程式导航

### 研究问题
确认账单后如何平滑跳转到开票页面？使用 `router.push()` 还是 `router.replace()`？

### 决策
**使用 `router.push()` 而非 `router.replace()`**

### 理由
1. **用户体验**：用户可以通过浏览器后退按钮返回账单详情页
2. **历史记录**：保留操作历史，方便用户回溯
3. **状态保持**：账单确认状态已保存，返回时无需重新确认

### 实现方案

```javascript
// BillDetail.vue - 确认账单成功后
async confirmBillAction() {
  this.submitting = true;
  
  try {
    // 1. 确认账单
    await this.confirmBill(this.billNo);
    
    showSuccess("账单确认成功");
    this.confirmDialogVisible = false;
    
    // 2. 等待状态同步完成
    await this.$nextTick();
    
    // 3. 跳转到开票页面，携带参数
    this.$router.push({
      name: 'InvoiceApply',
      params: { billNo: this.billNo },
      query: { fromConfirm: 'true' }  // 标记来源
    });
  } catch (error) {
    handleApiError(error, {
      customMessage: "账单确认失败"
    });
  } finally {
    this.submitting = false;
  }
}
```

### 路由配置

```javascript
// router/index.js
{
  path: '/invoice-apply/:billNo',
  name: 'InvoiceApply',
  component: () => import('@/pages/InvoiceApply.vue'),
  props: true,  // 将路由参数作为 props 传递
  meta: {
    requiresAuth: true,
    title: '填写开票信息'
  }
}
```

### 返回逻辑

```javascript
// InvoiceApply.vue - 返回按钮
handleBack() {
  // 检查是否有未提交的数据
  if (this.hasUnsavedData) {
    this.$confirm('您有未提交的开票信息，确认返回吗？', '提示', {
      type: 'warning'
    }).then(() => {
      this.$router.back();  // 返回上一页
    }).catch(() => {});
  } else {
    this.$router.back();
  }
}
```

---

## 2. Vuex 状态同步策略

### 研究问题
确认账单后跳转到新页面，如何确保状态正确加载？配置变更如何通知相关组件？

### 决策
**采用 Vuex 单一数据源 + 页面生命周期钩子**

### 理由
1. **数据一致性**：Vuex 作为唯一真实来源，避免组件内部状态
2. **响应式更新**：状态变化自动触发组件更新
3. **可追溯性**：所有状态变更通过 actions/mutations，易于调试

### 实现方案

```javascript
// store/modules/bill.js
const actions = {
  // 确认账单（包含状态同步）
  async confirmBill({ commit, dispatch }, billNo) {
    commit('SET_LOADING', true);
    
    try {
      // 1. 调用 API 确认账单
      const response = await mockApi.confirmBill(billNo);
      
      // 2. 更新账单状态
      commit('SET_BILL_STATUS', {
        billNo,
        status: 2  // 待开票
      });
      
      // 3. 同步订单状态
      await dispatch('order/updateAllOrdersCheckStatus', {
        billNo,
        status: 1  // 已核对
      }, { root: true });
      
      // 4. 刷新账单详情
      await dispatch('fetchBillDetail', billNo);
      
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  }
};
```

```javascript
// InvoiceApply.vue - 页面加载时检查状态
async created() {
  // 1. 从路由参数获取 billNo
  this.billNo = this.$route.params.billNo;
  
  // 2. 如果是从确认账单跳转过来，等待状态同步
  if (this.$route.query.fromConfirm === 'true') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 3. 加载账单数据
  await this.loadBillData();
  
  // 4. 检查拆分配置
  await this.checkSplitConfig();
  
  // 5. 生成开票信息行
  await this.generateInvoiceRows();
}
```

### 配置变更通知

```javascript
// store/modules/config.js
const actions = {
  async saveSplitConfig({ commit, dispatch }, config) {
    // 1. 保存配置
    commit('SET_SPLIT_CONFIG', config);
    
    // 2. 持久化到 LocalStorage
    storage.setSplitConfig(config);
    
    // 3. 触发全局事件（如果需要）
    window.dispatchEvent(new CustomEvent('split-config-changed', {
      detail: config
    }));
    
    return config;
  }
};

// InvoiceForm.vue - 监听配置变更
mounted() {
  window.addEventListener('split-config-changed', this.handleConfigChange);
},
beforeDestroy() {
  window.removeEventListener('split-config-changed', this.handleConfigChange);
},
methods: {
  handleConfigChange(event) {
    const newConfig = event.detail;
    // 重新生成开票信息行
    this.regenerateInvoiceRows(newConfig);
  }
}
```

---

## 3. LocalStorage 配置持久化

### 研究问题
如何设计用户配置的存储结构？如何确保性能？如何处理配置迁移？

### 决策
**使用 JSON 格式存储 + 版本化配置结构**

### 理由
1. **简单性**：JSON 易于序列化和反序列化
2. **可扩展性**：版本号支持未来配置结构变更
3. **性能**：LocalStorage 同步读取，适合小数据量配置

### 存储结构

```javascript
// LocalStorage key: compMOS_splitConfig
{
  version: '1.0.0',
  config: {
    dimension1: 'businessLine',
    dimension2: 'legalEntity',
    enabled: true,
    lastUpdated: '2026-01-23T10:30:00.000Z'
  }
}
```

### 实现方案

```javascript
// utils/storage.js
const STORAGE_KEYS = {
  SPLIT_CONFIG: 'compMOS_splitConfig',
  FIELD_CONFIG: 'compMOS_fieldConfig'
};

const CURRENT_VERSION = '1.0.0';

export const storage = {
  // 保存拆分配置
  setSplitConfig(config) {
    const data = {
      version: CURRENT_VERSION,
      config: {
        ...config,
        lastUpdated: new Date().toISOString()
      }
    };
    localStorage.setItem(STORAGE_KEYS.SPLIT_CONFIG, JSON.stringify(data));
  },
  
  // 获取拆分配置
  getSplitConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SPLIT_CONFIG);
      if (!raw) return null;
      
      const data = JSON.parse(raw);
      
      // 版本迁移逻辑
      if (data.version !== CURRENT_VERSION) {
        return this.migrateSplitConfig(data);
      }
      
      return data.config;
    } catch (error) {
      console.error('Failed to load split config:', error);
      return null;
    }
  },
  
  // 配置迁移
  migrateSplitConfig(oldData) {
    // 如果未来有版本变更，在此处理迁移逻辑
    if (oldData.version === '0.9.0') {
      // 示例：旧版本使用字符串，新版本使用对象
      return {
        dimension1: oldData.dimension1,
        dimension2: oldData.dimension2,
        enabled: true,
        lastUpdated: new Date().toISOString()
      };
    }
    
    return oldData.config;
  },
  
  // 清除配置
  clearSplitConfig() {
    localStorage.removeItem(STORAGE_KEYS.SPLIT_CONFIG);
  }
};
```

### 性能优化

```javascript
// store/modules/config.js - 缓存配置
const state = {
  splitConfig: null,  // 缓存的配置
  configLoaded: false  // 是否已加载
};

const actions = {
  // 懒加载配置
  async loadSplitConfig({ commit, state }) {
    if (state.configLoaded) {
      return state.splitConfig;  // 已加载，直接返回缓存
    }
    
    const config = storage.getSplitConfig();
    commit('SET_SPLIT_CONFIG', config);
    commit('SET_CONFIG_LOADED', true);
    
    return config;
  }
};
```

---

## 4. 动态数据拆分算法

### 研究问题
如何高效地按多维度拆分大量订单数据（10,000+）？如何展示树形结构？

### 决策
**使用 Map + Reduce 模式 + 虚拟滚动**

### 理由
1. **性能**：Map 数据结构提供 O(1) 查找
2. **灵活性**：支持任意维度组合
3. **可扩展**：易于添加新的拆分维度

### 拆分算法实现

```javascript
// utils/invoiceSplitter.js
export class InvoiceSplitter {
  /**
   * 按配置的维度拆分订单数据
   * @param {Array} orders - 订单列表
   * @param {Object} config - 拆分配置 {dimension1, dimension2}
   * @returns {Array} 分组后的开票信息行
   */
  static splitOrders(orders, config) {
    if (!config || (!config.dimension1 && !config.dimension2)) {
      // 无配置，按发票种类拆分
      return this.splitByInvoiceType(orders);
    }
    
    if (config.dimension1 && !config.dimension2) {
      // 单维度拆分
      return this.splitBySingleDimension(orders, config.dimension1);
    }
    
    // 双维度拆分
    return this.splitByTwoDimensions(orders, config.dimension1, config.dimension2);
  }
  
  /**
   * 按发票种类拆分（默认方式）
   */
  static splitByInvoiceType(orders) {
    const groups = new Map();
    
    orders.forEach(order => {
      const invoiceType = this.getInvoiceType(order.businessType);
      
      if (!groups.has(invoiceType)) {
        groups.set(invoiceType, {
          groupLabel: this.getInvoiceTypeName(invoiceType),
          invoiceType,
          orders: [],
          amount: 0,
          orderCount: 0
        });
      }
      
      const group = groups.get(invoiceType);
      group.orders.push(order);
      group.amount += order.amount;
      group.orderCount++;
    });
    
    return Array.from(groups.values()).map((group, index) => ({
      id: `invoice-${index}`,
      groupLabel: group.groupLabel,
      invoiceType: group.invoiceType,
      amount: group.amount,
      orderCount: group.orderCount,
      titleId: null,
      recipientInfo: null,
      quantity: group.orderCount,
      dimensionValues: {
        dimension1: null,
        dimension2: null
      }
    }));
  }
  
  /**
   * 按单一维度拆分
   */
  static splitBySingleDimension(orders, dimension) {
    const groups = new Map();
    
    orders.forEach(order => {
      const dimValue = this.getDimensionValue(order, dimension);
      const invoiceType = this.getInvoiceType(order.businessType);
      const key = `${invoiceType}_${dimValue}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          groupLabel: `${this.getInvoiceTypeName(invoiceType)} - ${this.getDimensionLabel(dimension, dimValue)}`,
          invoiceType,
          orders: [],
          amount: 0,
          orderCount: 0,
          dimensionValues: {
            dimension1: dimValue,
            dimension2: null
          }
        });
      }
      
      const group = groups.get(key);
      group.orders.push(order);
      group.amount += order.amount;
      group.orderCount++;
    });
    
    return Array.from(groups.values()).map((group, index) => ({
      id: `invoice-${index}`,
      ...group
    }));
  }
  
  /**
   * 按两个维度拆分（生成树形结构）
   */
  static splitByTwoDimensions(orders, dimension1, dimension2) {
    const tree = new Map();
    
    orders.forEach(order => {
      const dim1Value = this.getDimensionValue(order, dimension1);
      const dim2Value = this.getDimensionValue(order, dimension2);
      const invoiceType = this.getInvoiceType(order.businessType);
      
      // 一级分组 key
      const level1Key = `${dim1Value}`;
      if (!tree.has(level1Key)) {
        tree.set(level1Key, {
          label: this.getDimensionLabel(dimension1, dim1Value),
          children: new Map()
        });
      }
      
      // 二级分组 key
      const level2Key = `${invoiceType}_${dim2Value}`;
      const level1 = tree.get(level1Key);
      
      if (!level1.children.has(level2Key)) {
        level1.children.set(level2Key, {
          groupLabel: `${this.getInvoiceTypeName(invoiceType)} - ${this.getDimensionLabel(dimension2, dim2Value)}`,
          invoiceType,
          orders: [],
          amount: 0,
          orderCount: 0,
          dimensionValues: {
            dimension1: dim1Value,
            dimension2: dim2Value
          }
        });
      }
      
      const group = level1.children.get(level2Key);
      group.orders.push(order);
      group.amount += order.amount;
      group.orderCount++;
    });
    
    // 转换为扁平数组（用于表格展示）
    const result = [];
    let id = 0;
    
    tree.forEach((level1, key) => {
      level1.children.forEach(group => {
        result.push({
          id: `invoice-${id++}`,
          ...group
        });
      });
    });
    
    return result;
  }
  
  /**
   * 获取订单的维度值
   */
  static getDimensionValue(order, dimension) {
    const mapping = {
      businessLine: order.businessType,
      legalEntity: order.legalEntity,
      paymentAccount: order.paymentAccount,
      department: order.department
    };
    return mapping[dimension] || 'unknown';
  }
  
  /**
   * 获取维度值的显示标签
   */
  static getDimensionLabel(dimension, value) {
    // 可以从常量或映射表获取标签
    return value;
  }
  
  /**
   * 根据业务类型获取发票种类
   */
  static getInvoiceType(businessType) {
    if (businessType === 'flight') return 'FLIGHT_ITINERARY';
    if (businessType === 'train') return 'TRAIN_ITINERARY';
    return 'GENERAL';  // 酒店、用车默认增值税普票
  }
  
  /**
   * 获取发票种类名称
   */
  static getInvoiceTypeName(invoiceType) {
    const names = {
      GENERAL: '增值税普票',
      SPECIAL: '增值税专票',
      FLIGHT_ITINERARY: '机票电子行程单',
      TRAIN_ITINERARY: '火车票电子行程单'
    };
    return names[invoiceType] || invoiceType;
  }
}
```

### 性能优化

```javascript
// InvoiceForm.vue - 使用虚拟滚动
<template>
  <div class="invoice-form">
    <!-- 如果行数 > 100，使用虚拟滚动 -->
    <virtual-scroller
      v-if="invoiceRows.length > 100"
      :items="invoiceRows"
      :item-height="80"
      key-field="id"
    >
      <template #default="{ item }">
        <invoice-row :data="item" @update="handleRowUpdate"></invoice-row>
      </template>
    </virtual-scroller>
    
    <!-- 否则直接渲染 -->
    <div v-else>
      <invoice-row
        v-for="row in invoiceRows"
        :key="row.id"
        :data="row"
        @update="handleRowUpdate"
      ></invoice-row>
    </div>
  </div>
</template>
```

---

## 5. 组件通信模式

### 研究问题
配置对话框如何通知开票表单重新生成数据？使用 EventBus 还是 props/events？

### 决策
**使用 Vuex + Props/Events 组合模式**

### 理由
1. **解耦**：组件不直接依赖，通过 Vuex 通信
2. **可测试**：易于单元测试
3. **可追溯**：状态变更有明确路径

### 实现方案

```javascript
// InvoiceApply.vue - 父组件
<template>
  <div class="invoice-apply">
    <!-- 配置对话框 -->
    <invoice-split-config
      v-model="splitConfigVisible"
      :current-config="splitConfig"
      @save="handleSaveSplitConfig"
    ></invoice-split-config>
    
    <!-- 开票表单 -->
    <invoice-form
      :invoice-rows="invoiceRows"
      :split-config="splitConfig"
      @update="handleInvoiceFormUpdate"
    ></invoice-form>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      splitConfigVisible: false,
      invoiceRows: []
    };
  },
  computed: {
    ...mapState('config', ['splitConfig'])
  },
  methods: {
    async handleSaveSplitConfig(config) {
      // 1. 保存配置到 Vuex
      await this.$store.dispatch('config/saveSplitConfig', config);
      
      // 2. 重新生成开票信息行
      await this.regenerateInvoiceRows();
      
      // 3. 关闭对话框
      this.splitConfigVisible = false;
      
      this.$message.success('拆分配置已保存');
    },
    
    async regenerateInvoiceRows() {
      // 从 Vuex 获取最新配置
      const config = this.$store.state.config.splitConfig;
      const orders = this.$store.state.order.orderList;
      
      // 使用拆分算法生成开票行
      this.invoiceRows = InvoiceSplitter.splitOrders(orders, config);
    },
    
    handleInvoiceFormUpdate(data) {
      // 表单数据更新
      this.invoiceRows = data.invoiceRows;
    }
  }
};
</script>
```

### 避免 EventBus

**不使用 EventBus 的原因**：
1. 难以追踪：事件流不清晰
2. 难以测试：全局状态难以模拟
3. 易产生 bug：事件监听器未清理导致内存泄漏

**替代方案**：
- 父子组件：props + events
- 跨层级组件：Vuex
- 兄弟组件：通过共同父组件或 Vuex

---

## 总结

### 关键技术决策

| 问题 | 决策 | 理由 |
|------|------|------|
| 路由跳转 | `router.push()` | 保留历史记录，用户可返回 |
| 状态管理 | Vuex 单一数据源 | 数据一致性，响应式更新 |
| 配置持久化 | LocalStorage + 版本化 | 简单可靠，支持迁移 |
| 数据拆分 | Map + Reduce 模式 | 高性能，灵活可扩展 |
| 组件通信 | Vuex + Props/Events | 解耦，可测试，可追溯 |

### 性能指标

- 配置加载：< 10ms (LocalStorage 同步读取)
- 数据拆分：< 100ms (10,000 订单，Map 优化)
- 页面跳转：< 500ms (路由切换 + 状态加载)
- 表单渲染：< 1s (虚拟滚动支持)

### 下一步

1. ✅ 所有技术问题已研究完成
2. ➡️ 进入 Phase 1：生成 data-model.md 和 API contracts
3. ➡️ 进入 Phase 2：任务拆分 (`/speckit.tasks`)

### 参考资料

- [Vue Router 官方文档](https://router.vuejs.org/)
- [Vuex 官方文档](https://vuex.vuejs.org/)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [JavaScript Map Performance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

