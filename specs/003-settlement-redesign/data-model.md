# Data Model: 结算平台UI重构

**Feature**: 003-settlement-redesign  
**Date**: 2026-01-22  
**Status**: Design Phase

## Overview

本文档定义结算平台UI重构项目的完整数据模型，包括Vuex状态结构、API数据模型、表单数据模型、常量枚举、数据关系图和状态转换图。

---

## 1. Vuex State Models

### 1.1 Bill Module (`store/modules/bill.js`)

```javascript
{
  // 当前查看的账单
  currentBill: {
    billNo: String,              // 账单号，如"BILL-2025-001"
    billPeriod: String,          // 结算周期，如"2025-09"
    startDate: String,           // 结算开始日期 "2025-09-01"
    endDate: String,             // 结算结束日期 "2025-09-30"
    billStatus: Number,          // 账单状态：0-待确认, 1-待开票, 2-开票中, 3-待付款, 4-已结清
    totalAmount: Number,         // 账单总金额（元）
    pendingInvoiceAmount: Number, // 待开票金额（元）
    invoicedAmount: Number,      // 已开票金额（元）
    confirmTime: String | null,  // 确认时间 "2025-10-05 10:30:00"
    confirmBy: String | null,    // 确认人ID
    
    // 业务线金额统计
    amountByBusiness: {
      flight: Number,            // 机票金额
      hotel: Number,             // 酒店金额
      train: Number,             // 火车票金额
      car: Number                // 用车金额
    },
    
    // 订单数量统计
    orderCountByBusiness: {
      flight: Number,
      hotel: Number,
      train: Number,
      car: Number,
      total: Number
    },
    
    // 企业信息
    companyInfo: {
      companyName: String,       // 企业名称
      accountType: String,       // 账户类型：'prepaid'-预存, 'credit'-授信
      creditLimit: Number | null, // 信用额度（授信账户）
      balance: Number | null     // 账户余额（预存账户）
    }
  },
  
  // 账单列表
  billList: [
    {
      billNo: String,
      billPeriod: String,
      billStatus: Number,
      totalAmount: Number,
      pendingInvoiceAmount: Number,
      // ... 简化版字段
    }
  ],
  
  // 筛选条件
  filters: {
    dateRange: [String, String], // 日期范围 ["2025-01-01", "2025-12-31"]
    status: Number | null,       // 账单状态筛选
    orderNo: String              // 订单号搜索
  },
  
  // 分页信息
  pagination: {
    currentPage: Number,
    pageSize: Number,
    total: Number
  },
  
  // UI状态
  loading: Boolean,
  error: String | null
}
```

### 1.2 Order Module (`store/modules/order.js`)

```javascript
{
  // 当前账单的订单列表
  orderList: [
    {
      orderNo: String,              // 订单号
      billNo: String,               // 所属账单号
      businessType: String,         // 业务类型：'flight','hotel','train','car'
      checkStatus: Number,          // 核对状态：0-未核对, 1-已核对
      
      // 通用字段
      bookingDate: String,          // 预订日期 "2025-09-15"
      travelDate: String,           // 出行日期 "2025-09-20"
      bookerName: String,           // 预订人姓名
      travelerName: String,         // 出行人姓名
      payAmount: Number,            // 支付金额（元）
      
      // 财务字段
      legalEntity: String,          // 法人实体
      paymentAccount: String,       // 支付账户
      costCenter: String | null,    // 成本中心
      projectDept: String | null,   // 项目部门
      expenseType: String,          // 费用类型
      
      // 业务特有字段（根据businessType不同）
      businessInfo: {
        // 机票特有
        flightNo: String,           // 航班号 "CA1234"
        departureTime: String,      // 起飞时间 "2025-09-20 08:00"
        route: String,              // 航线 "北京→上海"
        cabinClass: String,         // 舱位等级 "经济舱"
        ticketNo: String,           // 电子客票号
        
        // 酒店特有
        hotelName: String,          // 酒店名称
        checkInDate: String,        // 入住日期
        checkOutDate: String,       // 离店日期
        roomCount: Number,          // 房间数量
        roomType: String,           // 房型
        guestName: String,          // 入住人姓名
        
        // 火车票特有
        trainNo: String,            // 车次 "G1234"
        departureTime: String,      // 出发时间
        trainRoute: String,         // 线路 "北京南→上海虹桥"
        seatClass: String,          // 座位等级 "二等座"
        idCardLast4: String,        // 身份证号后四位
        
        // 用车特有
        carTime: String,            // 用车时间
        startPoint: String,         // 起点
        endPoint: String,           // 终点
        carModel: String,           // 车型
        mileage: Number             // 行驶里程（公里）
      }
    }
  ],
  
  // 筛选后的订单列表
  filteredOrders: Array,
  
  // 搜索条件
  searchFilters: {
    orderNo: String,
    checkStatus: Number | null,
    travelerName: String,
    legalEntity: String
  },
  
  // 批量查询的订单号列表
  batchQueryOrderNos: Array,
  
  // 选中的订单（用于批量操作）
  selectedOrders: Array,
  
  // UI状态
  loading: Boolean,
  error: String | null
}
```

### 1.3 Invoice Module (`store/modules/invoice.js`)

```javascript
{
  // 开票汇总信息
  invoiceSummary: {
    shouldInvoiceAmount: Number,  // 应开票金额
    invoicedAmount: Number,       // 已开票金额
    remainingAmount: Number,      // 还可提交金额
    
    // 发票明细（按种类和摘要拆分）
    invoiceDetails: [
      {
        invoiceType: String,      // 发票种类
        invoiceSummary: String,   // 发票摘要
        shouldAmount: Number,     // 应开票金额
        invoicedAmount: Number,   // 已开票金额
        remainingAmount: Number,  // 还可提交金额
        orderCount: Number        // 对应订单数量
      }
    ]
  },
  
  // 发票抬头列表
  invoiceTitles: [
    {
      id: String,                  // 抬头ID
      titleName: String,           // 抬头名称
      taxNumber: String,           // 纳税人识别号
      address: String,             // 地址
      phone: String,               // 电话
      bankName: String,            // 开户行
      bankAccount: String,         // 账号
      isDefault: Boolean           // 是否默认
    }
  ],
  
  // 开票申请记录列表
  invoiceApplications: [
    {
      id: String,                  // 申请ID
      billNo: String,              // 账单号
      invoiceType: String,         // 发票类型
      invoiceContent: String,      // 发票内容
      amount: Number,              // 开票金额
      titleName: String,           // 发票抬头
      taxNumber: String,           // 税号
      submitter: String,           // 提交人
      applyTime: String,           // 申请时间
      status: String,              // 状态：'pending','processing','completed','failed'
      invoiceFiles: [              // 发票文件列表
        {
          fileName: String,
          fileUrl: String,
          fileSize: Number
        }
      ]
    }
  ],
  
  // 当前开票表单数据
  invoiceForm: {
    invoiceRows: [
      {
        invoiceType: String,       // 发票种类
        invoiceSummary: String,    // 发票摘要
        amount: Number,            // 开票金额
        titleId: String,           // 发票抬头ID
        receiverName: String,      // 收件人姓名
        receiverPhone: String,     // 收件人电话
        receiverEmail: String,     // 收件人邮箱
        receiverAddress: String,   // 收件地址
        unit: String,              // 单位（默认"元"）
        quantity: Number,          // 数量（1-99999）
        orderCount: Number         // 对应订单数（只读）
      }
    ]
  },
  
  // 拆分汇总配置
  splitConfig: {
    enabled: Boolean,
    dimension1: String | null,     // 字段一：'businessLine','legalEntity','paymentAccount','department'
    dimension2: String | null      // 字段二
  },
  
  // UI状态
  loading: Boolean,
  submitting: Boolean,
  error: String | null
}
```

### 1.4 Config Module (`store/modules/config.js`)

```javascript
{
  // 明细设置配置
  detailSettings: {
    enabled: Boolean,
    dimensions: [String],          // 选择的维度：['businessLine','legalEntity',...]
    hierarchyOrder: [String]       // 层级顺序
  },
  
  // 字段配置
  fieldConfig: {
    display: [                     // 显示字段
      {
        key: String,               // 字段key
        label: String,             // 字段标签
        width: Number,             // 列宽（可选）
        visible: Boolean           // 是否可见
      }
    ],
    excelExport: [String],         // Excel导出字段keys
    pdfExport: [String]            // PDF导出字段keys（最多20个）
  },
  
  // 用户偏好设置
  userPreferences: {
    pageSize: Number,              // 默认每页显示数量
    theme: String,                 // 主题（保留扩展）
    language: String               // 语言（保留扩展）
  },
  
  // 系统配置（从后台获取）
  systemConfig: {
    maxBatchQueryCount: Number,    // 批量查询最大数量（500）
    maxOrdersPerBill: Number,      // 每个账单最大订单数（10000）
    pdfMaxFields: Number,          // PDF最大字段数（20）
    exportTimeout: Number          // 导出超时时间（秒）
  }
}
```

### 1.5 User Module (`store/modules/user.js`)

```javascript
{
  // 用户信息
  userInfo: {
    userId: String,                // 用户ID
    userName: String,              // 用户姓名
    companyId: String,             // 企业ID
    companyName: String,           // 企业名称
    role: String,                  // 角色：'finance','admin'
    permissions: [String],         // 权限列表
    accountType: String            // 账户类型
  },
  
  // 认证信息
  token: String | null,
  tokenExpires: String | null,
  
  // UI状态
  loggedIn: Boolean
}
```

---

## 2. API Data Models

### 2.1 账单相关API

#### GET /api/bills
**请求参数**:
```javascript
{
  startDate: String,    // 开始日期 "2025-01-01"
  endDate: String,      // 结束日期 "2025-12-31"
  status: Number,       // 账单状态（可选）
  page: Number,         // 页码
  pageSize: Number      // 每页数量
}
```

**响应数据**:
```javascript
{
  code: 200,
  message: "success",
  data: {
    list: [
      {
        billNo: String,
        billPeriod: String,
        billStatus: Number,
        totalAmount: Number,
        pendingInvoiceAmount: Number,
        startDate: String,
        endDate: String
      }
    ],
    total: Number,
    page: Number,
    pageSize: Number
  }
}
```

#### GET /api/bills/:billNo
**响应数据**:
```javascript
{
  code: 200,
  message: "success",
  data: {
    billNo: String,
    billPeriod: String,
    startDate: String,
    endDate: String,
    billStatus: Number,
    totalAmount: Number,
    pendingInvoiceAmount: Number,
    invoicedAmount: Number,
    confirmTime: String | null,
    confirmBy: String | null,
    
    amountByBusiness: {
      flight: Number,
      hotel: Number,
      train: Number,
      car: Number
    },
    
    orderCountByBusiness: {
      flight: Number,
      hotel: Number,
      train: Number,
      car: Number,
      total: Number
    },
    
    companyInfo: {
      companyName: String,
      accountType: String,
      creditLimit: Number | null,
      balance: Number | null
    }
  }
}
```

#### POST /api/bills/:billNo/confirm
**请求体**:
```javascript
{
  billNo: String
}
```

**响应数据**:
```javascript
{
  code: 200,
  message: "账单确认成功",
  data: {
    billNo: String,
    billStatus: 1,          // 更新后的状态：待开票
    confirmTime: String,
    confirmBy: String,
    updatedOrderCount: Number  // 更新的订单数量
  }
}
```

### 2.2 订单相关API

#### GET /api/bills/:billNo/orders
**请求参数**:
```javascript
{
  businessType: String,     // 业务类型筛选（可选）
  checkStatus: Number,      // 核对状态筛选（可选）
  travelerName: String,     // 出行人搜索（可选）
  legalEntity: String,      // 法人实体筛选（可选）
  page: Number,
  pageSize: Number
}
```

**响应数据**:
```javascript
{
  code: 200,
  message: "success",
  data: {
    list: [
      {
        orderNo: String,
        billNo: String,
        businessType: String,
        checkStatus: Number,
        bookingDate: String,
        travelDate: String,
        bookerName: String,
        travelerName: String,
        payAmount: Number,
        legalEntity: String,
        paymentAccount: String,
        costCenter: String | null,
        projectDept: String | null,
        expenseType: String,
        businessInfo: Object    // 业务特有字段
      }
    ],
    total: Number,
    page: Number,
    pageSize: Number,
    summary: {
      totalAmount: Number,
      totalCount: Number
    }
  }
}
```

### 2.3 开票相关API

#### GET /api/bills/:billNo/invoice-summary
**响应数据**:
```javascript
{
  code: 200,
  message: "success",
  data: {
    shouldInvoiceAmount: Number,
    invoicedAmount: Number,
    remainingAmount: Number,
    invoiceDetails: [
      {
        invoiceType: String,
        invoiceSummary: String,
        shouldAmount: Number,
        invoicedAmount: Number,
        remainingAmount: Number,
        orderCount: Number
      }
    ]
  }
}
```

#### POST /api/invoices/apply
**请求体**:
```javascript
{
  billNo: String,
  invoiceRows: [
    {
      invoiceType: String,
      invoiceSummary: String,
      amount: Number,
      titleId: String,
      receiverName: String,
      receiverPhone: String,
      receiverEmail: String,
      receiverAddress: String,
      unit: String,
      quantity: Number
    }
  ]
}
```

**响应数据**:
```javascript
{
  code: 200,
  message: "开票申请提交成功",
  data: {
    applicationId: String,
    billNo: String,
    billStatus: 2,          // 更新后的状态：开票中
    applyTime: String,
    invoiceCount: Number
  }
}
```

---

## 3. Form Data Models

### 3.1 账单确认表单

```javascript
// 无表单，仅确认操作
{
  billNo: String          // 要确认的账单号
}
```

### 3.2 开票申请表单

```javascript
{
  billNo: String,
  invoiceRows: [
    {
      invoiceType: String,       // 必填，枚举值
      invoiceSummary: String,    // 必填
      amount: Number,            // 自动计算，只读
      titleId: String,           // 必填，发票抬头ID
      receiverName: String,      // 必填，2-50字符
      receiverPhone: String,     // 必填，11位手机号
      receiverEmail: String,     // 可选，邮箱格式
      receiverAddress: String,   // 必填，5-100字符
      unit: String,              // 默认"元"
      quantity: Number,          // 必填，1-99999
      orderCount: Number         // 只读
    }
  ]
}

// 验证规则
const rules = {
  receiverName: [
    { required: true, message: '请输入收件人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度为2-50个字符', trigger: 'blur' }
  ],
  receiverPhone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  receiverEmail: [
    { validator: validateEmail, trigger: 'blur' }
  ],
  receiverAddress: [
    { required: true, message: '请输入收件地址', trigger: 'blur' },
    { min: 5, max: 100, message: '地址长度为5-100个字符', trigger: 'blur' }
  ],
  quantity: [
    { required: true, validator: validateQuantity, trigger: 'blur' }
  ]
}
```

### 3.3 发票抬头表单

```javascript
{
  titleName: String,       // 必填，2-100字符
  taxNumber: String,       // 必填，15或18位数字/字母
  address: String,         // 必填，5-100字符
  phone: String,           // 必填，电话格式
  bankName: String,        // 必填，2-50字符
  bankAccount: String,     // 必填，10-30位数字
  isDefault: Boolean       // 可选，默认false
}

// 验证规则
const rules = {
  titleName: [
    { required: true, message: '请输入发票抬头', trigger: 'blur' },
    { min: 2, max: 100, message: '抬头长度为2-100个字符', trigger: 'blur' }
  ],
  taxNumber: [
    { required: true, validator: validateTaxNumber, trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' },
    { min: 5, max: 100, message: '地址长度为5-100个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^(\d{3,4}-?\d{7,8}|1[3-9]\d{9})$/, message: '请输入正确的电话号码', trigger: 'blur' }
  ],
  bankName: [
    { required: true, message: '请输入开户行', trigger: 'blur' },
    { min: 2, max: 50, message: '开户行名称长度为2-50个字符', trigger: 'blur' }
  ],
  bankAccount: [
    { required: true, message: '请输入银行账号', trigger: 'blur' },
    { pattern: /^\d{10,30}$/, message: '银行账号为10-30位数字', trigger: 'blur' }
  ]
}
```

---

## 4. Constants and Enums

### 4.1 账单状态

```javascript
export const BILL_STATUS = {
  PENDING_CONFIRM: 0,      // 待确认
  PENDING_INVOICE: 1,      // 待开票
  INVOICING: 2,            // 开票中
  PENDING_PAYMENT: 3,      // 待付款
  SETTLED: 4               // 已结清
}

export const BILL_STATUS_TEXT = {
  [BILL_STATUS.PENDING_CONFIRM]: '待确认',
  [BILL_STATUS.PENDING_INVOICE]: '待开票',
  [BILL_STATUS.INVOICING]: '开票中',
  [BILL_STATUS.PENDING_PAYMENT]: '待付款',
  [BILL_STATUS.SETTLED]: '已结清'
}

export const BILL_STATUS_COLOR = {
  [BILL_STATUS.PENDING_CONFIRM]: 'warning',
  [BILL_STATUS.PENDING_INVOICE]: 'primary',
  [BILL_STATUS.INVOICING]: 'primary',
  [BILL_STATUS.PENDING_PAYMENT]: 'success',
  [BILL_STATUS.SETTLED]: 'info'
}
```

### 4.2 业务类型

```javascript
export const BUSINESS_TYPE = {
  FLIGHT: 'flight',        // 机票
  HOTEL: 'hotel',          // 酒店
  TRAIN: 'train',          // 火车票
  CAR: 'car'               // 用车
}

export const BUSINESS_TYPE_TEXT = {
  [BUSINESS_TYPE.FLIGHT]: '机票',
  [BUSINESS_TYPE.HOTEL]: '酒店',
  [BUSINESS_TYPE.TRAIN]: '火车票',
  [BUSINESS_TYPE.CAR]: '用车'
}
```

### 4.3 发票类型

```javascript
export const INVOICE_TYPE = {
  VAT_GENERAL: 'vat_general',          // 增值税普通发票
  VAT_SPECIAL: 'vat_special',          // 增值税专用发票
  FLIGHT_ITINERARY: 'flight_itinerary', // 机票电子行程单
  TRAIN_ITINERARY: 'train_itinerary'   // 火车票电子行程单
}

export const INVOICE_TYPE_TEXT = {
  [INVOICE_TYPE.VAT_GENERAL]: '增值税普通发票',
  [INVOICE_TYPE.VAT_SPECIAL]: '增值税专用发票',
  [INVOICE_TYPE.FLIGHT_ITINERARY]: '机票电子行程单',
  [INVOICE_TYPE.TRAIN_ITINERARY]: '火车票电子行程单'
}
```

### 4.4 明细设置维度

```javascript
export const DETAIL_DIMENSION = {
  BUSINESS_LINE: 'businessLine',       // 业务线
  LEGAL_ENTITY: 'legalEntity',         // 法人实体
  PAYMENT_ACCOUNT: 'paymentAccount',   // 支付账户
  DEPARTMENT: 'department'             // 部门
}

export const DETAIL_DIMENSION_TEXT = {
  [DETAIL_DIMENSION.BUSINESS_LINE]: '业务线',
  [DETAIL_DIMENSION.LEGAL_ENTITY]: '法人实体',
  [DETAIL_DIMENSION.PAYMENT_ACCOUNT]: '支付账户',
  [DETAIL_DIMENSION.DEPARTMENT]: '部门'
}
```

---

## 5. Data Relationships

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│   Company       │         │   User           │
│                 │  1    * │                  │
│ - companyId     ├─────────┤ - userId         │
│ - companyName   │         │ - userName       │
│ - accountType   │         │ - companyId (FK) │
└─────────────────┘         └──────────────────┘
         │ 1                         │ 1
         │                           │
         │                           │
         │ *                         │ *
┌─────────────────┐         ┌──────────────────┐
│   Bill          │         │  InvoiceTitle    │
│                 │         │                  │
│ - billNo (PK)   │         │ - id (PK)        │
│ - companyId (FK)│         │ - companyId (FK) │
│ - billStatus    │         │ - titleName      │
│ - totalAmount   │         │ - taxNumber      │
│ - confirmBy (FK)│         └──────────────────┘
└─────────────────┘
         │ 1
         │
         │ *
┌─────────────────┐
│   Order         │
│                 │
│ - orderNo (PK)  │
│ - billNo (FK)   │
│ - businessType  │
│ - checkStatus   │
│ - payAmount     │
└─────────────────┘
         │ *
         │
         │ 1
┌──────────────────┐
│  InvoiceApplication │
│                     │
│ - id (PK)           │
│ - billNo (FK)       │
│ - titleId (FK)      │
│ - amount            │
│ - status            │
└─────────────────────┘
```

### 5.2 Key Relationships

1. **Company ↔ Bill**: 一对多，一个企业有多个账单
2. **Bill ↔ Order**: 一对多，一个账单包含多个订单
3. **Bill ↔ InvoiceApplication**: 一对多，一个账单可以有多个开票申请
4. **Company ↔ InvoiceTitle**: 一对多，一个企业可以配置多个发票抬头
5. **User ↔ Bill**: 多对多（通过confirmBy），用户可以确认多个账单

---

## 6. State Transition Diagrams

### 6.1 账单状态转换

```
     ┌──────────────┐
     │ 待确认 (0)   │
     │ PENDING_     │
     │ CONFIRM      │
     └──────┬───────┘
            │
            │ 确认账单
            │ (confirmBill)
            ↓
     ┌──────────────┐
     │ 待开票 (1)   │◄───────┐
     │ PENDING_     │        │ 撤销确认
     │ INVOICE      │        │ (cancelConfirm)
     └──────┬───────┘        │
            │                │
            │ 提交开票申请    │
            │ (applyInvoice)  │
            ↓                │
     ┌──────────────┐        │
     │ 开票中 (2)   │────────┘
     │ INVOICING    │   不可撤销
     └──────┬───────┘
            │
            │ 后台开票完成
            │ (invoiceCompleted)
            ↓
     ┌──────────────┐
     │ 待付款 (3)   │
     │ PENDING_     │
     │ PAYMENT      │
     └──────┬───────┘
            │
            │ 后台确认收款
            │ (paymentConfirmed)
            ↓
     ┌──────────────┐
     │ 已结清 (4)   │
     │ SETTLED      │
     └──────────────┘
```

**状态转换规则**:
1. 待确认 → 待开票：用户点击"确认账单"，所有订单状态同步变为"已核对"
2. 待开票 → 开票中：用户提交开票申请
3. 待开票 ← 开票中：仅在"待开票"状态允许撤销确认，"开票中"后不可逆
4. 开票中 → 待付款：后台开票完成（自动）
5. 待付款 → 已结清：后台确认收款（自动）

### 6.2 订单核对状态转换

```
     ┌──────────────┐
     │ 未核对 (0)   │
     └──────┬───────┘
            │
            │ 账单确认
            │ (关联账单confirmBill)
            ↓
     ┌──────────────┐
     │ 已核对 (1)   │◄───────┐
     └──────────────┘        │
            │                │
            │ 撤销确认        │
            │ (关联账单       │
            └────────────────┘
             cancelConfirm)
```

---

## 7. Data Conversion and Formatting

### 7.1 金额格式化

```javascript
/**
 * 格式化金额：添加千分位分隔符和货币符号
 * @param {Number} amount - 金额（元）
 * @param {Boolean} withSymbol - 是否添加¥符号
 * @return {String} 格式化后的金额，如"¥1,234.56"
 */
export function formatAmount(amount, withSymbol = true) {
  if (amount === null || amount === undefined) return '-'
  
  const formatted = Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return withSymbol ? `¥${formatted}` : formatted
}

// 使用示例
formatAmount(1234.56)        // "¥1,234.56"
formatAmount(1234.56, false) // "1,234.56"
```

### 7.2 日期时间格式化

```javascript
import dayjs from 'dayjs'

/**
 * 格式化日期
 * @param {String} date - ISO日期字符串
 * @param {String} format - 格式模板
 * @return {String} 格式化后的日期
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 格式化日期时间
 * @param {String} datetime - ISO日期时间字符串
 * @return {String} 格式化后的日期时间
 */
export function formatDateTime(datetime) {
  if (!datetime) return '-'
  return dayjs(datetime).format('YYYY-MM-DD HH:mm:ss')
}

// 使用示例
formatDate('2025-09-20')                // "2025-09-20"
formatDate('2025-09-20', 'YYYY年MM月DD日') // "2025年09月20日"
formatDateTime('2025-09-20T10:30:00Z')  // "2025-09-20 10:30:00"
```

### 7.3 业务类型映射

```javascript
/**
 * 根据业务类型获取发票类型
 * @param {String} businessType - 业务类型
 * @return {String} 发票类型
 */
export function getInvoiceTypeByBusiness(businessType) {
  const mapping = {
    [BUSINESS_TYPE.FLIGHT]: INVOICE_TYPE.FLIGHT_ITINERARY,
    [BUSINESS_TYPE.TRAIN]: INVOICE_TYPE.TRAIN_ITINERARY,
    [BUSINESS_TYPE.HOTEL]: INVOICE_TYPE.VAT_GENERAL,
    [BUSINESS_TYPE.CAR]: INVOICE_TYPE.VAT_GENERAL
  }
  return mapping[businessType] || INVOICE_TYPE.VAT_GENERAL
}
```

---

## 8. Data Validation Rules

### 8.1 前端验证

```javascript
// 手机号验证
export const phoneRule = /^1[3-9]\d{9}$/

// 邮箱验证
export const emailRule = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// 税号验证（15或18位）
export const taxNumberRule = /^[0-9A-Z]{15}$|^[0-9A-Z]{18}$/

// 数量验证（1-99999）
export const quantityRule = /^\d{1,5}$/

// 银行账号验证（10-30位数字）
export const bankAccountRule = /^\d{10,30}$/
```

### 8.2 后端验证

后端API应进行以下验证：
1. **账单确认**: 验证账单状态为"待确认"，账单所有订单存在
2. **开票申请**: 验证账单状态为"待开票"，发票金额不超过可开票金额，发票抬头存在
3. **撤销确认**: 验证账单状态为"待开票"（不允许在"开票中"后撤销）
4. **数据完整性**: 所有必填字段不为空，金额为正数，日期格式正确

---

**Data Model Status**: ✅ Completed  
**Ready for Contracts Generation**: Yes

