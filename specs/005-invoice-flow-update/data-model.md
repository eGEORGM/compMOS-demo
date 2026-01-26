# Data Model: 开票流程优化

**Feature**: 005-invoice-flow-update  
**Date**: 2026-01-23  
**Version**: 1.0.0

## 概述

本文档定义了开票流程优化所涉及的核心数据实体、字段、关系和状态转换规则。

## 核心实体

### 1. SplitConfiguration (拆分配置)

用户配置的发票拆分汇总维度，用于控制开票信息的分组展示方式。

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| dimension1 | String | 否 | 第一拆分维度 | `'businessLine'` |
| dimension2 | String | 否 | 第二拆分维度 | `'legalEntity'` |
| enabled | Boolean | 是 | 是否启用拆分 | `true` |
| lastUpdated | String (ISO 8601) | 是 | 最后更新时间 | `'2026-01-23T10:30:00.000Z'` |

**维度枚举**：

```typescript
type DimensionType =
  | 'businessLine'      // 业务线（机票/酒店/火车票/用车）
  | 'legalEntity'       // 法人实体
  | 'paymentAccount'    // 支付账户
  | 'department'        // 部门
  | null;               // 不使用该维度
```

**验证规则**：
- `dimension1` 和 `dimension2` 不能相同
- 至少一个维度为 null（允许0-2个维度）
- 如果两个维度都为 null，则 `enabled` 自动设为 false

**存储位置**：
- Vuex Store: `state.config.splitConfig`
- LocalStorage: `compMOS_splitConfig` (持久化)

---

### 2. InvoiceRow (开票信息行)

根据拆分配置生成的开票信息行，每行对应一个维度组合或发票种类。

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | String | 是 | 唯一标识 | `'invoice-1'` |
| groupLabel | String | 是 | 分组标签 | `'机票 - 北京分公司'` |
| invoiceType | String | 是 | 发票种类代码 | `'FLIGHT_ITINERARY'` |
| invoiceTypeName | String | 是 | 发票种类名称 | `'机票电子行程单'` |
| amount | Number | 是 | 开票金额（元） | `35000.00` |
| orderCount | Number | 是 | 订单数量 | `15` |
| titleId | String | 否 | 发票抬头ID | `'T001'` |
| titleName | String | 否 | 发票抬头名称 | `'示例科技有限公司'` |
| taxNumber | String | 否 | 纳税人识别号 | `'91110108MA01234567'` |
| recipientInfo | Object | 否 | 接收人信息 | (见下方) |
| quantity | Number | 是 | 数量 | `15` |
| dimensionValues | Object | 是 | 维度值 | (见下方) |

**RecipientInfo (接收人信息) 子对象**：

| 字段名 | 类型 | 必填 | 验证规则 | 示例 |
|--------|------|------|----------|------|
| name | String | 是 | 不能为空 | `'张三'` |
| phone | String | 是 | 11位数字 | `'13800138000'` |
| email | String | 是 | 标准邮箱格式 | `'zhangsan@example.com'` |
| address | String | 是 | 最大100字符 | `'北京市海淀区中关村大街1号'` |

**DimensionValues (维度值) 子对象**：

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| dimension1 | String/null | 第一维度的值 | `'flight'` (businessLine) |
| dimension2 | String/null | 第二维度的值 | `'北京分公司'` (legalEntity) |

**发票种类枚举**：

```typescript
enum InvoiceType {
  GENERAL = 'GENERAL',                    // 增值税普票
  SPECIAL = 'SPECIAL',                    // 增值税专票
  FLIGHT_ITINERARY = 'FLIGHT_ITINERARY',  // 机票电子行程单
  TRAIN_ITINERARY = 'TRAIN_ITINERARY'     // 火车票电子行程单
}
```

**业务类型到发票种类的映射**：

| 业务类型 (businessType) | 发票种类 (invoiceType) |
|-------------------------|------------------------|
| flight (机票) | FLIGHT_ITINERARY |
| train (火车票) | TRAIN_ITINERARY |
| hotel (酒店) | GENERAL 或 SPECIAL |
| car (用车) | GENERAL 或 SPECIAL |

**计算逻辑**：
- `groupLabel`: 根据拆分维度和发票种类组合生成，如 `"机票 - 北京分公司"` 或仅 `"增值税普票"`
- `amount`: 该分组内所有订单金额总和
- `orderCount`: 该分组内的订单数量
- `quantity`: 默认等于 `orderCount`，用户可编辑，最大 99999

---

### 3. InvoiceApplication (开票申请记录)

用户提交的开票申请记录，包含申请信息和处理状态。

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| applicationNo | String | 是 | 申请编号 | `'APP20260123001'` |
| billNo | String | 是 | 账单号 | `'BILL202601001'` |
| invoiceType | String | 是 | 发票类型名称 | `'机票电子行程单'` |
| content | String | 是 | 发票内容 | `'国内机票行程单（25张）'` |
| amount | Number | 是 | 开票金额（元） | `68500.00` |
| titleName | String | 是 | 发票抬头名称 | `'示例科技有限公司'` |
| taxNumber | String | 是 | 纳税人识别号 | `'91110108MA01234567'` |
| submitter | String | 是 | 提交人 | `'李四'` |
| applyTime | String (ISO 8601) | 是 | 申请时间 | `'2026-01-23T14:20:00.000Z'` |
| status | String | 是 | 处理状态 | `'processing'` |
| remark | String | 否 | 备注 | `'开票中'` |
| isFlushed | Boolean | 是 | 是否已红冲 | `false` |
| flushedTime | String (ISO 8601) | 否 | 红冲时间 | `'2026-01-25T10:00:00.000Z'` |
| flushedReason | String | 否 | 红冲原因 | `'发票抬头有误'` |

**状态枚举**：

```typescript
enum ApplicationStatus {
  PROCESSING = 'processing',  // 处理中
  COMPLETED = 'completed',    // 已完成
  FAILED = 'failed'           // 失败
}
```

**状态转换**：

```
processing (处理中)
   ├─> completed (已完成) [后台开票成功]
   └─> failed (失败) [后台开票失败]

completed (已完成)
   └─> 可执行操作：下载、红冲

failed (失败)
   └─> 可执行操作：重新提交
```

---

### 4. Bill (账单包) - 扩展

账单包在本次优化中的状态流转扩展。

**状态流转**：

```
待确认 (PENDING_CONFIRM = 0)
   ↓ [用户点击"确认账单"]
待开票 (PENDING_INVOICE = 2)
   ↓ [用户提交开票申请]
开票中 (INVOICING = 3)
   ↓ [后台开票完成]
待付款 (PENDING_PAYMENT = 4)
   ↓ [后台确认收款]
已结清 (SETTLED = 5)
```

**关键变更点**：
- **确认账单后**：账单状态从 `0` 变为 `2`，同时所有订单的 `checkStatus` 变为 `1` (已核对)
- **跳转逻辑**：确认账单成功后，前端自动跳转到开票页面 (`/invoice-apply/:billNo`)
- **撤销确认**：在 `待开票 (2)` 状态下，用户可以撤销确认，账单回退到 `待确认 (0)`

---

## 数据关系

### ER 图

```
┌──────────────────┐
│  Bill (账单包)   │
│  - billNo        │
│  - billStatus    │
│  - totalAmount   │
└──────┬───────────┘
       │ 1
       │
       │ N
┌──────┴───────────┐
│  Order (订单)    │
│  - orderNo       │
│  - businessType  │
│  - amount        │
│  - checkStatus   │
│  - legalEntity   │
│  - department    │
└──────┬───────────┘
       │
       │ (拆分算法)
       │
       ↓
┌──────────────────┐
│  InvoiceRow      │
│  (开票信息行)    │
│  - invoiceType   │
│  - amount        │
│  - orderCount    │
└──────┬───────────┘
       │ N
       │
       │ 1
┌──────┴──────────────┐
│  InvoiceApplication │
│  (开票申请记录)     │
│  - applicationNo    │
│  - status           │
└─────────────────────┘
```

### 配置与数据关系

```
┌──────────────────┐
│  SplitConfiguration │  (用户配置)
│  - dimension1       │
│  - dimension2       │
└──────┬──────────────┘
       │
       │ 应用于
       ↓
┌──────────────────┐
│  Order (订单)    │  (原始数据)
│  - businessType  │
│  - legalEntity   │
│  - department    │
└──────┬───────────┘
       │
       │ 拆分生成
       ↓
┌──────────────────┐
│  InvoiceRow      │  (生成的开票行)
│  - groupLabel    │
│  - dimensionValues │
└──────────────────┘
```

---

## 数据流

### 1. 确认账单 → 跳转开票页面

```
用户操作
   ↓
BillDetail.confirmBillAction()
   ↓
Vuex: bill/confirmBill(billNo)
   ├─> Mock API: confirmBill(billNo)
   ├─> 更新账单状态: billStatus = 2
   ├─> 更新所有订单状态: checkStatus = 1
   └─> 返回成功
   ↓
router.push({ name: 'InvoiceApply', params: { billNo } })
   ↓
InvoiceApply 页面加载
```

### 2. 开票页面加载 → 检测配置 → 生成开票行

```
InvoiceApply.created()
   ↓
Vuex: config/loadSplitConfig()
   ├─> 从 LocalStorage 读取配置
   └─> 返回 SplitConfiguration
   ↓
Vuex: order/fetchOrderList(billNo)
   ├─> Mock API: getOrderList(billNo)
   └─> 返回 Order[]
   ↓
InvoiceSplitter.splitOrders(orders, config)
   ├─> 根据配置拆分订单
   └─> 生成 InvoiceRow[]
   ↓
渲染开票信息表
```

### 3. 配置变更 → 重新生成开票行

```
用户点击"重新配置拆分汇总"
   ↓
InvoiceSplitConfig 对话框打开
   ↓
用户选择 dimension1, dimension2
   ↓
InvoiceSplitConfig.save()
   ↓
Vuex: config/saveSplitConfig(config)
   ├─> 保存到 Vuex State
   ├─> 保存到 LocalStorage
   └─> 触发事件 'split-config-changed'
   ↓
InvoiceApply.handleSaveSplitConfig()
   ↓
InvoiceSplitter.splitOrders(orders, newConfig)
   ├─> 根据新配置重新拆分
   └─> 生成新的 InvoiceRow[]
   ↓
清空已填写的开票信息
   ↓
重新渲染开票信息表
```

### 4. 提交开票 → 生成申请记录

```
用户点击"提交开票"
   ↓
InvoiceApply.handleSubmitInvoice()
   ↓
验证所有必填字段
   ↓
Vuex: invoice/submitInvoiceApplication({ billNo, invoiceRows })
   ├─> Mock API: submitInvoiceApplication(data)
   ├─> 更新账单状态: billStatus = 3 (开票中)
   ├─> 生成 InvoiceApplication 记录
   └─> 返回成功
   ↓
router.replace({ name: 'BillDetail', params: { billNo }, query: { tab: 'invoice' } })
   ↓
BillDetail 页面显示"开票汇总" tab
   ↓
InvoiceSummaryContent 显示 InvoiceApplication 列表
```

---

## 数据验证规则

### SplitConfiguration 验证

```javascript
function validateSplitConfig(config) {
  // 规则1：维度不能重复
  if (config.dimension1 && config.dimension1 === config.dimension2) {
    throw new Error('字段一和字段二不能重复');
  }
  
  // 规则2：维度值必须合法
  const validDimensions = ['businessLine', 'legalEntity', 'paymentAccount', 'department', null];
  if (!validDimensions.includes(config.dimension1) || !validDimensions.includes(config.dimension2)) {
    throw new Error('维度值不合法');
  }
  
  // 规则3：如果两个维度都为 null，enabled 应为 false
  if (!config.dimension1 && !config.dimension2 && config.enabled) {
    return { ...config, enabled: false };
  }
  
  return config;
}
```

### InvoiceRow 验证

```javascript
function validateInvoiceRow(row) {
  const errors = [];
  
  // 必填字段检查
  if (!row.titleId) {
    errors.push({ field: 'titleId', message: '请选择发票抬头' });
  }
  
  if (!row.recipientInfo) {
    errors.push({ field: 'recipientInfo', message: '请填写接收人信息' });
  } else {
    // 接收人信息验证
    if (!row.recipientInfo.name) {
      errors.push({ field: 'recipientInfo.name', message: '请填写接收人姓名' });
    }
    
    if (!row.recipientInfo.phone || !/^\d{11}$/.test(row.recipientInfo.phone)) {
      errors.push({ field: 'recipientInfo.phone', message: '请填写11位手机号' });
    }
    
    if (!row.recipientInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.recipientInfo.email)) {
      errors.push({ field: 'recipientInfo.email', message: '请填写正确的邮箱地址' });
    }
    
    if (!row.recipientInfo.address || row.recipientInfo.address.length > 100) {
      errors.push({ field: 'recipientInfo.address', message: '地址不能为空且不超过100字符' });
    }
  }
  
  // 数量验证
  if (row.quantity < 1 || row.quantity > 99999) {
    errors.push({ field: 'quantity', message: '数量必须在1-99999之间' });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## Mock 数据示例

### SplitConfiguration

```json
{
  "dimension1": "businessLine",
  "dimension2": "legalEntity",
  "enabled": true,
  "lastUpdated": "2026-01-23T10:30:00.000Z"
}
```

### InvoiceRow (按业务线 + 法人实体拆分)

```json
[
  {
    "id": "invoice-1",
    "groupLabel": "机票 - 北京分公司",
    "invoiceType": "FLIGHT_ITINERARY",
    "invoiceTypeName": "机票电子行程单",
    "amount": 35000.00,
    "orderCount": 15,
    "titleId": "T001",
    "titleName": "示例科技有限公司",
    "taxNumber": "91110108MA01234567",
    "recipientInfo": {
      "name": "张三",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "address": "北京市海淀区中关村大街1号"
    },
    "quantity": 15,
    "dimensionValues": {
      "dimension1": "flight",
      "dimension2": "北京分公司"
    }
  },
  {
    "id": "invoice-2",
    "groupLabel": "机票 - 上海分公司",
    "invoiceType": "FLIGHT_ITINERARY",
    "invoiceTypeName": "机票电子行程单",
    "amount": 33500.00,
    "orderCount": 10,
    "titleId": null,
    "recipientInfo": null,
    "quantity": 10,
    "dimensionValues": {
      "dimension1": "flight",
      "dimension2": "上海分公司"
    }
  }
]
```

### InvoiceApplication

```json
{
  "applicationNo": "APP20260123001",
  "billNo": "BILL202601001",
  "invoiceType": "机票电子行程单",
  "content": "国内机票行程单（25张）",
  "amount": 68500.00,
  "titleName": "示例科技有限公司",
  "taxNumber": "91110108MA01234567",
  "submitter": "李四",
  "applyTime": "2026-01-23T14:20:00.000Z",
  "status": "processing",
  "remark": "开票中",
  "isFlushed": false
}
```

---

## 数据完整性约束

1. **账单确认原子性**：确认账单时，账单状态和所有订单状态必须同时更新，任一失败则全部回滚
2. **配置一致性**：拆分配置在 Vuex 和 LocalStorage 中必须保持一致
3. **开票行唯一性**：每个维度组合只生成一行开票信息
4. **申请记录可追溯**：每次提交开票都生成新的申请记录，不覆盖历史记录
5. **金额精度**：所有金额字段保留两位小数，计算时使用 Decimal 类型避免精度丢失

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2026-01-23 | 初始版本，定义核心实体和数据流 |

