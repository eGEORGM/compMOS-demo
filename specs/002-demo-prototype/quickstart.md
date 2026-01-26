# Quickstart Guide: Demo原型快速启动

**Feature**: 结算平台Demo原型  
**Date**: 2026-01-16  
**Phase**: 1 - Quickstart  
**Related**: [plan.md](./plan.md) | [spec.md](./spec.md) | [mock-data.md](./mock-data.md)

本指南帮助开发者在**5分钟内**启动demo原型，快速验证核心功能。

---

## 🚀 5分钟快速启动

### 第1步：环境准备（1分钟）

确保已安装：
- **Node.js 12+**
- **npm 6+**

```bash
# 检查环境
node -v  # 应显示 v12.x.x 或更高
npm -v   # 应显示 6.x.x 或更高
```

### 第2步：创建项目（2分钟）

```bash
# 使用Vue CLI快速创建项目（如果没有安装Vue CLI）
npm install -g @vue/cli

# 创建Vue 2.x项目
vue create compmos-demo

# 选择配置：
# ? Please pick a preset: Manually select features
# ? Check the features needed for your project:
#   (*) Choose Vue version
#   (*) Babel
#   (*) Router
#   ( ) Vuex  # demo不需要
#   (*) CSS Pre-processors
#   (*) Linter / Formatter
# ? Choose a version of Vue.js: 2.x
# ? Use history mode for router? Yes
# ? Pick a CSS pre-processor: Less
# ? Pick a linter / formatter config: Prettier
# ? Pick additional lint features: Lint on save
# ? Where do you prefer placing config: In dedicated config files

# 进入项目目录
cd compmos-demo
```

### 第3步：安装依赖（1分钟）

```bash
# 安装Element UI和Mock.js
npm install element-ui@2.13.0 mockjs@1.1.0 moment@2.25.1 lodash@4.17.14
```

### 第4步：配置项目（30秒）

#### 配置Element UI（src/main.js）

```javascript
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
```

#### 配置路由（src/router/index.js）

```javascript
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/bills'
  },
  {
    path: '/bills',
    name: 'BillList',
    component: () => import('../views/BillList.vue')
  },
  {
    path: '/bills/:billNo',
    name: 'BillDetail',
    component: () => import('../views/BillDetail.vue')
  },
  {
    path: '/invoices/apply',
    name: 'InvoiceApply',
    component: () => import('../views/InvoiceApply.vue')
  },
  {
    path: '/invoices',
    name: 'InvoiceList',
    component: () => import('../views/InvoiceList.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
```

### 第5步：创建Mock数据（30秒）

创建 `src/mock/mockData.js`，复制[mock-data.md](./mock-data.md)中的完整Mock数据生成脚本。

在 `src/main.js` 中引入（开发环境）：

```javascript
// 在import之后，Vue.use之前
if (process.env.NODE_ENV === 'development') {
  require('./mock/mockData');
}
```

### 第6步：启动开发服务器（30秒）

```bash
npm run serve
```

打开浏览器访问：`http://localhost:8080`

---

## 📁 最小可运行结构

```
compmos-demo/
├── src/
│   ├── mock/
│   │   ├── mockData.js      # Mock数据主文件
│   │   ├── bills.js         # 账单数据
│   │   ├── orders.js        # 订单数据
│   │   ├── invoices.js      # 发票数据
│   │   └── users.js         # 用户数据
│   ├── views/
│   │   ├── BillList.vue     # P1: 账单列表页（优先实现）
│   │   ├── BillDetail.vue   # P1: 账单详情页（优先实现）
│   │   ├── InvoiceApply.vue # P2: 发票申请页
│   │   └── InvoiceList.vue  # P2: 发票列表页
│   ├── components/          # 业务组件（按需创建）
│   ├── router/
│   │   └── index.js         # 路由配置
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── package.json
└── README.md
```

---

## 🎨 核心页面实现

### BillList.vue（账单列表）

**最小可演示版本**（100行代码）：

```vue
<template>
  <div class="bill-list-page">
    <div class="page-header">
      <h1>账单管理</h1>
    </div>
    
    <el-card>
      <!-- 筛选区 -->
      <el-form :inline="true">
        <el-form-item label="账单状态">
          <el-select v-model="filterStatus" placeholder="全部" clearable>
            <el-option label="待对账" :value="0" />
            <el-option label="已核对" :value="1" />
            <el-option label="开票中" :value="2" />
            <el-option label="已结清" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 账单列表 -->
      <div class="bill-cards">
        <el-card
          v-for="bill in billList"
          :key="bill.billNo"
          shadow="hover"
          class="bill-card"
          @click.native="viewBillDetail(bill.billNo)"
        >
          <div class="bill-header">
            <span class="bill-no">{{ bill.billNo }}</span>
            <el-tag :type="getStatusType(bill.billStatus)">
              {{ getStatusText(bill.billStatus) }}
            </el-tag>
          </div>
          <div class="bill-info">
            <div class="info-item">
              <label>账单周期：</label>
              <span>{{ bill.billCycle }}</span>
            </div>
            <div class="info-item">
              <label>总金额：</label>
              <span class="amount">¥ {{ bill.totalAmount.toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <label>订单数：</label>
              <span>{{ bill.totalOrderCount }}笔</span>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getBillPackages } from '@/mock/mockData';

export default {
  name: 'BillList',
  data() {
    return {
      billList: [],
      filterStatus: undefined
    };
  },
  mounted() {
    this.fetchBillList();
  },
  methods: {
    fetchBillList() {
      const result = getBillPackages({ billStatus: this.filterStatus });
      this.billList = result.list;
    },
    handleSearch() {
      this.fetchBillList();
    },
    viewBillDetail(billNo) {
      this.$router.push(`/bills/${billNo}`);
    },
    getStatusText(status) {
      const map = { 0: '待对账', 1: '已核对', 2: '开票中', 3: '已结清' };
      return map[status];
    },
    getStatusType(status) {
      const map = { 0: 'warning', 1: 'success', 2: 'primary', 3: 'info' };
      return map[status];
    }
  }
};
</script>

<style lang="less" scoped>
.bill-list-page {
  padding: 20px;
  
  .page-header {
    margin-bottom: 20px;
    
    h1 {
      font-size: 24px;
      font-weight: 500;
    }
  }
  
  .bill-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    
    .bill-card {
      cursor: pointer;
      transition: transform 0.2s;
      
      &:hover {
        transform: translateY(-4px);
      }
      
      .bill-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
        
        .bill-no {
          font-weight: 500;
          font-size: 16px;
        }
      }
      
      .bill-info {
        .info-item {
          margin-bottom: 8px;
          
          label {
            color: #909399;
            margin-right: 5px;
          }
          
          .amount {
            color: #f56c6c;
            font-weight: 500;
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>
```

### BillDetail.vue（账单详情 - 核心页面）

**最小可演示版本**（150行代码）：

```vue
<template>
  <div class="bill-detail-page">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/bills' }">账单管理</el-breadcrumb-item>
        <el-breadcrumb-item>账单详情</el-breadcrumb-item>
      </el-breadcrumb>
      <h1>{{ billNo }}</h1>
    </div>
    
    <!-- 账单汇总 -->
    <el-card class="summary-card">
      <div class="summary-info">
        <div class="summary-item">
          <label>账单周期：</label>
          <span>{{ bill.billCycle }}</span>
        </div>
        <div class="summary-item">
          <label>总金额：</label>
          <span class="amount">¥ {{ bill.totalAmount.toLocaleString() }}</span>
        </div>
        <div class="summary-item">
          <label>已核对：</label>
          <span>{{ checkedCount }}/{{ totalCount }}</span>
        </div>
        <div class="summary-item">
          <label>状态：</label>
          <el-tag :type="getStatusType(bill.billStatus)">
            {{ getStatusText(bill.billStatus) }}
          </el-tag>
        </div>
      </div>
    </el-card>
    
    <!-- 订单明细 -->
    <el-card class="orders-card">
      <div slot="header">
        <span>订单明细</span>
        <div class="header-actions">
          <el-input
            v-model="searchName"
            placeholder="搜索出行人"
            prefix-icon="el-icon-search"
            style="width: 200px; margin-right: 10px;"
            @input="handleSearch"
          />
          <el-select v-model="filterType" placeholder="业务类型" clearable style="width: 120px; margin-right: 10px;" @change="handleSearch">
            <el-option label="机票" value="002" />
            <el-option label="火车" value="003" />
            <el-option label="酒店" value="001" />
          </el-select>
          <el-button
            v-if="bill.billStatus === 0"
            type="primary"
            :disabled="checkedCount !== totalCount"
            :loading="confirming"
            @click="handleConfirmBill"
          >
            全部确认
          </el-button>
          <el-button
            v-if="bill.billStatus === 1"
            type="success"
            @click="handleApplyInvoice"
          >
            申请发票
          </el-button>
        </div>
      </div>
      
      <el-table :data="orderList" border>
        <el-table-column width="55" v-if="bill.billStatus === 0">
          <template slot-scope="scope">
            <el-checkbox
              v-model="scope.row.checkStatus"
              @change="handleCheckChange"
            />
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单号" width="150" />
        <el-table-column prop="businessType" label="业务类型" width="100">
          <template slot-scope="scope">
            {{ getBusinessTypeName(scope.row.businessType) }}
          </template>
        </el-table-column>
        <el-table-column prop="travelerName" label="出行人" width="100" />
        <el-table-column prop="payAmount" label="金额（元）" width="120">
          <template slot-scope="scope">
            {{ scope.row.payAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="支付时间" width="180" />
        <el-table-column prop="costCenter" label="成本中心" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getBillDetail, getOrderDetails, confirmBill } from '@/mock/mockData';

export default {
  name: 'BillDetail',
  data() {
    return {
      billNo: '',
      bill: {},
      orderList: [],
      searchName: '',
      filterType: '',
      confirming: false
    };
  },
  computed: {
    checkedCount() {
      return this.orderList.filter(o => o.checkStatus).length;
    },
    totalCount() {
      return this.orderList.length;
    }
  },
  mounted() {
    this.billNo = this.$route.params.billNo;
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.bill = getBillDetail(this.billNo);
      const result = getOrderDetails(this.billNo, {
        travelerName: this.searchName,
        businessType: this.filterType
      });
      this.orderList = result.list;
    },
    handleSearch() {
      this.fetchData();
    },
    handleCheckChange() {
      // 实时更新统计
      this.$forceUpdate();
    },
    handleConfirmBill() {
      this.$confirm('确认账单后将无法修改核对状态，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.confirming = true;
        setTimeout(() => {
          const result = confirmBill(this.billNo);
          this.confirming = false;
          if (result.success) {
            this.$message.success('账单确认成功');
            this.fetchData();
          } else {
            this.$message.error(result.message);
          }
        }, 2000); // 模拟延迟
      });
    },
    handleApplyInvoice() {
      this.$router.push(`/invoices/apply?billNo=${this.billNo}`);
    },
    getStatusText(status) {
      const map = { 0: '待对账', 1: '已核对', 2: '开票中', 3: '已结清' };
      return map[status];
    },
    getStatusType(status) {
      const map = { 0: 'warning', 1: 'success', 2: 'primary', 3: 'info' };
      return map[status];
    },
    getBusinessTypeName(type) {
      const map = { '001': '酒店', '002': '机票', '003': '火车' };
      return map[type];
    }
  }
};
</script>

<style lang="less" scoped>
.bill-detail-page {
  padding: 20px;
  
  .page-header {
    margin-bottom: 20px;
    
    h1 {
      font-size: 24px;
      font-weight: 500;
      margin-top: 10px;
    }
  }
  
  .summary-card {
    margin-bottom: 20px;
    
    .summary-info {
      display: flex;
      justify-content: space-around;
      
      .summary-item {
        label {
          color: #909399;
          margin-right: 5px;
        }
        
        .amount {
          color: #f56c6c;
          font-weight: 500;
          font-size: 18px;
        }
      }
    }
  }
  
  .orders-card {
    .header-actions {
      float: right;
      display: flex;
      align-items: center;
    }
  }
}
</style>
```

---

## 🎯 开发优先级

### Day 1-2: P1 - 账单核对流程（必须完成）

1. ✅ 创建Mock数据文件
2. ✅ 实现 `BillList.vue`（账单列表）
3. ✅ 实现 `BillDetail.vue`（账单详情）
4. ✅ 测试账单核对流程：查看→勾选→确认→状态更新

**验收标准**：
- 可以查看账单列表，点击进入详情
- 可以勾选订单，看到统计实时更新
- 可以点击"全部确认"，2秒延迟后账单状态更新
- 返回列表，状态标签颜色变化

### Day 3: P2 - 发票申请流程

1. 实现 `InvoiceApply.vue`（发票申请）
2. 实现 `InvoiceList.vue`（发票列表）
3. 测试发票申请流程：申请→提交→查看批次→查看发票

### Day 4: P3 - 数据筛选与导出

1. 完善搜索和筛选功能
2. 实现导出按钮（模拟交互，不实际下载）
3. 优化界面细节

### Day 5: P4 - 调账功能 + 整体测试

1. 实现用户类型切换（顶部下拉菜单）
2. 实现调账按钮的权限控制
3. 实现调账表单（可选）
4. 整体测试和打磨

---

## 🐛 常见问题

### Q1: Mock数据不生效？
**A**: 确保在 `src/main.js` 中正确引入了mock文件，并检查浏览器控制台是否有错误。

### Q2: 路由跳转404？
**A**: 检查 `vue.config.js` 是否配置了devServer的historyApiFallback：

```javascript
module.exports = {
  devServer: {
    historyApiFallback: true
  }
};
```

### Q3: Element UI样式不生效？
**A**: 确保在 `main.js` 中导入了Element UI的CSS：

```javascript
import 'element-ui/lib/theme-chalk/index.css';
```

### Q4: 如何切换用户类型（预存/授信）？
**A**: 在浏览器控制台执行：

```javascript
// 切换为授信企业
localStorage.setItem('demo_user_type', '2');
location.reload();

// 切换回预存企业
localStorage.setItem('demo_user_type', '1');
location.reload();
```

---

## 📚 相关文档

- [spec.md](./spec.md) - 功能规范（用户故事、需求、成功标准）
- [plan.md](./plan.md) - 技术实现计划（架构、组件设计）
- [mock-data.md](./mock-data.md) - Mock数据详细设计
- [001-settlement-automation/quickstart.md](../001-settlement-automation/quickstart.md) - 完整版快速启动指南（正式版本参考）

---

## 🎉 下一步

完成demo开发后：

1. **准备演示脚本**：编写10分钟演示的讲稿
2. **准备反馈表格**：设计stakeholder反馈收集表
3. **在实际环境测试**：在演示场地的电脑和投影仪上测试
4. **录制演示视频**：作为备用演示方案

祝开发顺利！🚀

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16  
**Status**: ✅ Quickstart Guide Complete

