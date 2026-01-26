# Quick Start Guide: 开票流程优化

**Feature**: 005-invoice-flow-update  
**Version**: 1.0.0  
**Last Updated**: 2026-01-23

## 概述

本指南帮助开发者快速上手 005-invoice-flow-update 功能的开发、测试和演示。

## 前置要求

- Node.js 14+ 
- npm 6+
- 已完成 003-settlement-redesign 的开发（本功能基于其之上）
- 对 Vue.js 2.x、Vuex、Vue Router 有基本了解

## 本地开发环境搭建

### 1. 安装依赖

```bash
cd compMOS-demo
npm install
```

### 2. 启动开发服务器

```bash
npm run serve
```

服务启动后，访问 http://localhost:8080

### 3. 项目结构

```
compMOS-demo/
├── src/
│   ├── pages/
│   │   ├── BillDetail.vue          # 账单详情页（修改）
│   │   └── InvoiceApply.vue        # 开票申请页（修改）
│   ├── components/
│   │   └── bill/
│   │       ├── InvoiceSummaryContent.vue   # 开票汇总（简化）
│   │       ├── InvoiceForm.vue             # 开票表单（增强）
│   │       └── InvoiceSplitConfig.vue      # 拆分配置对话框
│   ├── store/
│   │   └── modules/
│   │       ├── bill.js             # 账单模块（修改）
│   │       ├── config.js           # 配置模块（增强）
│   │       └── invoice.js          # 开票模块（修改）
│   ├── mock/
│   │   ├── index.js                # Mock API 入口（修改）
│   │   ├── invoicesNew.js          # 开票 Mock 数据（增强）
│   │   └── configNew.js            # 配置 Mock 数据（新增）
│   └── utils/
│       ├── invoiceSplitter.js      # 开票数据拆分工具（新增）
│       └── configValidator.js      # 配置验证工具（新增）
```

## 功能演示路径

### 路径 1：完整开票流程（无配置）

**目标**：演示从确认账单到开票申请的完整流程（不使用拆分配置）

1. **访问账单列表**
   - URL: http://localhost:8080/#/bills
   - 选择一个"待确认"状态的账单，点击"查看详情"

2. **查看账单详情**
   - URL: http://localhost:8080/#/bill-detail/BILL202601001
   - 切换到"账单汇总" tab，查看账单总金额和各业务线数据
   - 切换到"账单明细" tab，查看订单列表

3. **确认账单**
   - 点击"确认账单"按钮
   - 在弹出的确认对话框中，查看账单金额和订单数
   - 点击"确认"按钮

4. **自动跳转到开票页面** ⭐ 核心变更
   - 确认成功后，页面自动跳转到开票页面
   - URL: http://localhost:8080/#/invoice-apply/BILL202601001?fromConfirm=true
   - 页面顶部显示"填写开票信息"标题和返回按钮

5. **查看配置引导** ⭐ 核心变更
   - 如果用户未配置拆分维度，页面顶部显示引导提示
   - 提示文案："建议配置拆分汇总维度以更准确地生成开票信息"
   - 显示"立即配置"按钮

6. **不使用配置，直接填写开票信息**
   - 关闭配置引导提示
   - 查看开票信息表，按发票种类（机票电子行程单、增值税普票等）展示
   - 为每行填写：
     - 发票抬头（下拉选择）
     - 接收人信息（姓名、电话、邮箱、地址）
     - 数量（默认值可保持不变）

7. **提交开票申请**
   - 所有必填字段填写完整后，"提交开票"按钮高亮
   - 点击"提交开票"按钮
   - 在最终确认窗口中查看开票信息汇总
   - 点击"确认提交"

8. **查看开票汇总** ⭐ 核心变更
   - 提交成功后，页面返回账单详情页的"开票汇总" tab
   - 仅显示"开票申请记录表"，不显示发票列表
   - 最新的申请记录显示在最上方，状态为"处理中"

---

### 路径 2：使用拆分配置的开票流程

**目标**：演示配置拆分维度并应用到开票信息生成的流程

1. **访问账单详情（待确认状态）**
   - URL: http://localhost:8080/#/bill-detail/BILL202601002

2. **确认账单并跳转**
   - 点击"确认账单"→ 确认对话框 → 点击"确认"
   - 自动跳转到开票页面

3. **配置拆分汇总** ⭐ 核心变更
   - 点击配置引导提示中的"立即配置"按钮
   - 在拆分汇总配置对话框中：
     - 字段一：选择"业务线"
     - 字段二：选择"法人实体"
   - 点击"保存"

4. **查看分组后的开票信息表** ⭐ 核心变更
   - 配置保存后，开票信息表自动重新生成
   - 每行显示维度组合标签，如："机票 - 北京分公司"、"酒店 - 北京分公司"
   - 每行的金额和订单数量是该组合的汇总数据

5. **填写开票信息**
   - 为每个分组独立填写发票抬头和接收人信息
   - 不同分组可以选择不同的发票抬头

6. **提交开票申请**
   - 点击"提交开票"→ 确认窗口 → "确认提交"
   - 返回开票汇总 tab，查看新增的申请记录

---

### 路径 3：修改拆分配置并重新生成

**目标**：演示配置变更时的数据重载逻辑

1. **进入开票页面（已配置拆分）**
   - 假设已按"业务线"+"法人实体"配置
   - 开票信息表显示多行分组数据

2. **填写部分开票信息**
   - 为前两行填写发票抬头和接收人信息
   - 不提交

3. **重新配置拆分汇总** ⭐ 核心变更
   - 点击页面顶部的"重新配置拆分汇总"按钮
   - 在配置对话框中修改为：
     - 字段一：选择"业务线"
     - 字段二：选择"部门"
   - 点击"保存"

4. **确认配置变更警告** ⭐ 核心变更
   - 系统弹出警告："配置已变更，之前填写的开票信息将被清空，是否继续？"
   - 点击"确认"

5. **查看重新生成的开票信息表**
   - 开票信息表按新配置重新分组
   - 之前填写的数据已清空
   - 需要重新填写所有开票信息

---

### 路径 4：返回账单详情查看开票汇总

**目标**：演示在开票过程中返回查看开票汇总的流程

1. **进入开票页面**
   - 确认账单后进入开票页面

2. **点击返回按钮** ⭐ 核心变更
   - 点击页面顶部的返回按钮
   - 如果有未填写完的开票信息，弹出确认对话框："您有未提交的开票信息，确认返回吗？"
   - 点击"确认"

3. **返回账单详情页**
   - 页面返回到账单详情页
   - 自动切换到"开票汇总" tab

4. **再次进入开票页面**
   - 点击"一键开票"按钮
   - 重新进入开票页面
   - 显示新的开票信息表（之前未提交的数据不保留）

---

## Mock 数据说明

### 拆分配置 Mock 数据

**文件位置**：`src/mock/configNew.js`

```javascript
// 默认无配置
getSplitConfig() {
  return {
    code: 200,
    success: true,
    data: null
  };
}

// 保存配置后返回
saveSplitConfig(config) {
  return {
    code: 200,
    success: true,
    data: {
      ...config,
      lastUpdated: new Date().toISOString()
    }
  };
}
```

### 开票信息行生成 Mock 数据

**文件位置**：`src/mock/invoicesNew.js`

```javascript
// 根据拆分配置生成开票行
generateInvoiceRows(billNo, splitConfig) {
  const orders = getOrdersByBillNo(billNo);
  
  if (!splitConfig || (!splitConfig.dimension1 && !splitConfig.dimension2)) {
    // 无配置：按发票种类
    return splitByInvoiceType(orders);
  }
  
  if (splitConfig.dimension1 && !splitConfig.dimension2) {
    // 单维度拆分
    return splitBySingleDimension(orders, splitConfig.dimension1);
  }
  
  // 双维度拆分
  return splitByTwoDimensions(orders, splitConfig.dimension1, splitConfig.dimension2);
}
```

### 开票申请记录 Mock 数据

**文件位置**：`src/mock/invoicesNew.js`

```javascript
// 提交开票后生成申请记录
submitInvoiceApplication(data) {
  const application = {
    applicationNo: `APP${Date.now()}`,
    billNo: data.billNo,
    invoiceType: data.invoiceRows[0].invoiceTypeName,
    content: generateContent(data.invoiceRows),
    amount: calculateTotalAmount(data.invoiceRows),
    titleName: data.invoiceRows[0].titleName,
    taxNumber: data.invoiceRows[0].taxNumber,
    submitter: getCurrentUser(),
    applyTime: new Date().toISOString(),
    status: 'processing',
    remark: '开票中',
    isFlushed: false
  };
  
  // 保存到内存
  invoiceApplications.push(application);
  
  return {
    code: 200,
    success: true,
    data: {
      applicationId: application.applicationNo,
      billNo: data.billNo,
      applyTime: application.applyTime,
      invoiceCount: data.invoiceRows.length,
      status: 1
    }
  };
}
```

## 常见问题排查

### 问题 1：确认账单后没有跳转到开票页面

**排查步骤**：

1. 打开浏览器控制台，查看是否有 JavaScript 错误
2. 检查 `BillDetail.vue` 的 `confirmBillAction` 方法
3. 确认 Vuex action `bill/confirmBill` 是否正确执行
4. 检查路由配置：`router/index.js` 中是否有 `InvoiceApply` 路由

**预期行为**：
- 确认账单成功后，应自动调用 `this.$router.push({ name: 'InvoiceApply', params: { billNo: this.billNo }, query: { fromConfirm: 'true' } })`
- URL 应变为 `/#/invoice-apply/BILL202601001?fromConfirm=true`

---

### 问题 2：开票页面没有显示配置引导提示

**排查步骤**：

1. 检查用户是否已配置拆分维度
2. 打开浏览器控制台，输入 `localStorage.getItem('compMOS_splitConfig')`
3. 如果返回值不为 `null`，说明用户已配置，不会显示引导提示
4. 清除配置：在控制台输入 `localStorage.removeItem('compMOS_splitConfig')`，刷新页面

**预期行为**：
- 如果 `splitConfig` 为 `null` 或 `undefined`，应显示配置引导提示
- 引导提示包含文案和"立即配置"按钮

---

### 问题 3：配置变更后开票信息表没有重新生成

**排查步骤**：

1. 打开浏览器控制台，查看是否有 JavaScript 错误
2. 检查 `InvoiceApply.vue` 的 `handleSaveSplitConfig` 方法
3. 确认 `InvoiceSplitter.splitOrders` 是否被正确调用
4. 检查 Vuex store 中的 `splitConfig` 是否已更新

**预期行为**：
- 保存配置后，`invoiceRows` 应重新计算
- 开票信息表应立即刷新，显示新的分组

---

### 问题 4：提交开票后开票汇总仍显示发票列表

**排查步骤**：

1. 检查 `InvoiceSummaryContent.vue` 组件
2. 确认组件中是否有渲染发票列表的代码（应该已移除）
3. 检查 `<el-table>` 或类似的表格组件，确保只渲染开票申请记录

**预期行为**：
- 开票汇总 tab 仅显示"开票申请记录表"（InvoiceRecordTable）
- 不显示"发票列表"区域

---

## 性能测试建议

### 测试场景 1：大数据量拆分

**目标**：验证 10,000+ 订单的拆分性能

**步骤**：
1. 修改 Mock 数据生成函数，生成 10,000 条订单
2. 配置两个维度拆分（如业务线 + 法人实体）
3. 测量 `InvoiceSplitter.splitOrders` 的执行时间
4. 测量开票信息表的渲染时间

**预期结果**：
- 拆分计算：< 100ms
- 表格渲染：< 1s（如使用虚拟滚动）

---

### 测试场景 2：配置变更响应时间

**目标**：验证配置变更后数据重载的响应速度

**步骤**：
1. 进入开票页面（已配置拆分）
2. 点击"重新配置拆分汇总"
3. 修改配置并保存
4. 测量从保存到开票信息表重新渲染的时间

**预期结果**：
- 配置保存 + 数据重载 + 渲染：< 1s

---

## 开发建议

### 1. 使用 Vue Devtools

安装 Vue Devtools 浏览器扩展，方便调试 Vuex 状态和组件 props：
- Chrome: https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/

### 2. 开启 Source Maps

确保 `vue.config.js` 中开启了 source maps，方便调试：

```javascript
module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  }
};
```

### 3. 使用 ESLint

运行 ESLint 检查代码质量：

```bash
npm run lint
```

### 4. 代码格式化

使用 Prettier 格式化代码：

```bash
npm run format
```

---

## 下一步

- **任务拆分**：执行 `/speckit.tasks` 命令生成详细的任务列表
- **实施开发**：按任务列表逐步实现功能
- **测试验证**：按本文档的演示路径进行功能测试
- **代码审查**：提交代码前进行代码审查

---

## 参考资料

- [Feature Specification](./spec.md) - 功能规范
- [Implementation Plan](./plan.md) - 实施计划
- [Research Document](./research.md) - 技术研究
- [Data Model](./data-model.md) - 数据模型
- [API Contracts](./contracts/) - API 合约

---

**文档版本**: 1.0.0  
**最后更新**: 2026-01-23  
**维护者**: compMOS Team

