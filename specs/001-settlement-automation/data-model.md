# Data Model: 企业自动化结算平台

**Feature**: 企业自动化结算平台 (compMOS)  
**Date**: 2026-01-15  
**Phase**: 1 - Design  
**Related**: [plan.md](./plan.md) | [spec.md](./spec.md) | [research.md](./research.md)

本文档定义compMOS前端系统的数据模型，包括Vuex状态管理模型、API交互数据模型和表单数据模型。

---

## 目录

1. [Vuex状态模型](#1-vuex状态模型)
2. [API数据模型](#2-api数据模型)
3. [表单数据模型](#3-表单数据模型)
4. [常量和枚举](#4-常量和枚举)
5. [数据关系图](#5-数据关系图)

---

## 1. Vuex状态模型

### 1.1 User Module (用户模块)

**路径**: `src/store/modules/user.js`

```javascript
{
  // 用户基础信息
  userInfo: {
    userId: String,              // 用户ID
    username: String,            // 用户名
    name: String,                // 姓名
    companyId: String,           // 所属企业ID
    companyName: String,         // 企业名称
    accountType: Number,         // 账户类型 1-预存 2-授信
    permissions: Array<String>,  // 权限列表
    lastLoginTime: String,       // 最后登录时间
    avatar: String               // 头像URL
  },
  
  // 登录状态
  token: String,                 // JWT Token
  tokenExpiry: Number,           // Token过期时间（时间戳）
  
  // 权限缓存
  permissionMap: Object,         // 权限快速查询Map {permission: true}
  
  // 企业配置
  companyConfig: {
    defaultInvoiceHeader: String,    // 默认发票抬头
    defaultTaxpayerNumber: String,   // 默认纳税人识别号
    addressList: Array<Object>,      // 收货地址列表
    settleManagerInfo: {             // 结算人员信息
      name: String,
      phone: String,
      email: String
    }
  }
}
```

**主要Mutations**:
- `SET_USER_INFO`: 设置用户信息
- `SET_TOKEN`: 设置Token
- `UPDATE_PERMISSIONS`: 更新权限列表
- `SET_COMPANY_CONFIG`: 设置企业配置
- `CLEAR_USER_INFO`: 清除用户信息（登出）

**主要Actions**:
- `login`: 用户登录
- `logout`: 用户登出
- `getUserInfo`: 获取用户信息
- `refreshToken`: 刷新Token

**主要Getters**:
- `hasPermission(permission)`: 检查是否有指定权限
- `isPrePaidAccount`: 是否是预存企业
- `isCreditAccount`: 是否是授信企业
- `isLoggedIn`: 是否已登录

---

### 1.2 Bill Module (账单模块)

**路径**: `src/store/modules/bill.js`

```javascript
{
  // 账单包列表
  billPackages: Array<{
    billNo: String,              // 账单编号
    billCycle: String,           // 账单周期 YYYY-MM
    billStatus: Number,          // 账单状态 0-待对账 1-对账完成 2-开票中 3-已结清
    billStatusText: String,      // 账单状态文本
    totalAmount: Number,         // 总金额（元）
    totalOrderCount: Number,     // 总订单数
    businessSummary: {           // 各业务线汇总
      hotel: { amount: Number, count: Number },
      flight: { amount: Number, count: Number },
      train: { amount: Number, count: Number }
    },
    visible: Boolean,            // 用户可见性
    createTime: String,          // 生成时间
    confirmTime: String,         // 确认时间
    settleTime: String           // 结清时间
  }>,
  
  // 当前选中的账单包
  currentBill: Object | null,
  
  // 账单订单明细
  orderDetails: Array<{
    orderNo: String,             // 订单号
    businessType: String,        // 业务类型 001-酒店 002-机票 003-火车
    travelerName: String,        // 出行人姓名
    bookerName: String,          // 预订人姓名
    payAmount: Number,           // 支付金额（元）
    payTime: String,             // 支付时间
    travelTime: String,          // 出行时间
    checkStatus: Boolean,        // 核对状态
    costCenter: String,          // 成本中心
    costUnderDep: String,        // 成本归属部门
    invoiceTitle: String,        // 发票抬头
    productProvider: String,     // 供应商
    ticketNo: String             // 票号
  }>,
  
  // 账单筛选条件
  filterForm: {
    billCycle: String,           // 账单周期
    billStatus: Number,          // 账单状态
    dateRange: Array<String>     // 日期范围
  },
  
  // 订单筛选条件
  orderFilterForm: {
    businessType: String,        // 业务类型
    travelerName: String,        // 出行人姓名
    dateRange: Array<String>,    // 日期范围
    checkStatus: Boolean | null  // 核对状态
  },
  
  // 分页信息
  pagination: {
    currentPage: Number,         // 当前页
    pageSize: Number,            // 每页条数
    total: Number                // 总条数
  },
  
  // 加载状态
  loading: {
    billList: Boolean,           // 账单列表加载中
    orderList: Boolean,          // 订单明细加载中
    confirmBill: Boolean,        // 确认账单中
    exportBill: Boolean          // 导出账单中
  }
}
```

**主要Mutations**:
- `SET_BILL_PACKAGES`: 设置账单包列表
- `SET_CURRENT_BILL`: 设置当前账单包
- `SET_ORDER_DETAILS`: 设置订单明细
- `UPDATE_ORDER_CHECK_STATUS`: 更新订单核对状态
- `UPDATE_BILL_STATUS`: 更新账单状态
- `SET_FILTER_FORM`: 设置筛选条件
- `SET_LOADING`: 设置加载状态

**主要Actions**:
- `fetchBillPackages`: 获取账单包列表
- `fetchBillDetail`: 获取账单详情
- `fetchOrderDetails`: 获取订单明细
- `confirmBill`: 确认账单
- `exportBill`: 导出账单
- `updateOrderCheckStatus`: 更新订单核对状态
- `batchUpdateOrders`: 批量更新订单（调账）

**主要Getters**:
- `checkedOrders`: 已核对的订单列表
- `uncheckedOrders`: 未核对的订单列表
- `businessTypeOrders(type)`: 按业务类型筛选订单
- `canConfirmBill`: 是否可以确认账单（所有订单已核对）

---

### 1.3 Invoice Module (发票模块)

**路径**: `src/store/modules/invoice.js`

```javascript
{
  // 发票批次列表
  invoiceBatches: Array<{
    batchId: String,             // 批次号
    billNo: String,              // 关联账单编号
    batchStatus: Number,         // 批次状态 0-待拆分 1-拆分中 2-拆分完成 3-开票中 4-开票完成 5-开票失败
    batchStatusText: String,     // 批次状态文本
    operateType: String,         // 操作类型 normal-普通开票 train-火车票换开
    createTime: String,          // 创建时间
    finishTime: String,          // 完成时间
    expectedInvoiceCount: Number,    // 预计开票数量
    actualInvoiceCount: Number,      // 实际开票数量
    invoiceSummary: {                // 发票汇总
      totalAmount: Number,           // 应开发票金额
      invoicedAmount: Number,        // 已开发票金额
      byType: {                      // 按类型汇总
        vat: { count: Number, amount: Number },      // 增值税专票
        general: { count: Number, amount: Number },  // 普通发票
        itinerary: { count: Number, amount: Number } // 电子行程单
      }
    },
    errorMessage: String         // 失败原因
  }>,
  
  // 发票列表
  invoices: Array<{
    invoiceNo: String,           // 发票号
    invoiceType: String,         // 发票类型 001-专票 002-普票 003-行程单 004-火车票
    invoiceTypeName: String,     // 发票类型名称
    invoiceAmount: Number,       // 发票金额（元）
    buyInvoiceHeader: String,    // 购方抬头
    buyTaxNumber: String,        // 购方税号
    invoiceStatus: Number,       // 发票状态 0-开票中 1-开票成功 2-开票失败
    invoiceStatusText: String,   // 发票状态文本
    invoiceTime: String,         // 开具时间
    invoiceFileUrl: String,      // 文件URL
    downloadLink: String,        // 下载链接
    orderList: Array<String>     // 关联订单列表
  }>,
  
  // 当前发票申请表单
  applyForm: {
    billNo: String,              // 账单编号
    buyInvoiceHeader: String,    // 购方抬头
    buyTaxNumber: String,        // 购方税号
    receiverName: String,        // 收货人
    receiverPhone: String,       // 收货电话
    receiverAddress: String      // 收货地址
  },
  
  // 发票筛选条件
  filterForm: {
    invoiceType: String,         // 发票类型
    invoiceStatus: Number,       // 发票状态
    dateRange: Array<String>     // 日期范围
  },
  
  // 加载状态
  loading: {
    batchList: Boolean,          // 批次列表加载中
    invoiceList: Boolean,        // 发票列表加载中
    applyInvoice: Boolean,       // 申请开票中
    downloadInvoice: Boolean     // 下载发票中
  }
}
```

**主要Mutations**:
- `SET_INVOICE_BATCHES`: 设置发票批次列表
- `SET_INVOICES`: 设置发票列表
- `SET_APPLY_FORM`: 设置申请表单
- `UPDATE_BATCH_STATUS`: 更新批次状态
- `SET_LOADING`: 设置加载状态

**主要Actions**:
- `fetchInvoiceBatches`: 获取发票批次列表
- `fetchInvoices`: 获取发票列表
- `applyInvoice`: 申请开票
- `downloadInvoice`: 下载发票
- `batchDownloadInvoices`: 批量下载发票

**主要Getters**:
- `completedBatches`: 已完成的批次列表
- `failedBatches`: 失败的批次列表
- `downloadableInvoices`: 可下载的发票列表
- `totalInvoiceAmount`: 发票总金额

---

## 2. API数据模型

### 2.1 BillPackage（账单包）

**接口**: `GET /api/bills`

```typescript
interface BillPackageListResponse {
  status: string;        // '00000' 表示成功
  message: string;
  data: {
    list: BillPackage[];
    total: number;
    pageNum: number;
    pageSize: number;
  };
}

interface BillPackage {
  billNo: string;                  // 账单编号
  companyId: string;               // 企业ID
  companyName: string;             // 企业名称
  billCycle: string;               // 账单周期 YYYY-MM
  billType: number;                // 出账方式 0-支付时间 1-出行时间
  billStatus: number;              // 账单状态 0-待对账 1-对账完成 2-开票中 3-已结清
  totalAmount: number;             // 总金额（元）
  totalOrderCount: number;         // 总订单数
  visible: boolean;                // 用户可见性
  
  // 各业务线汇总
  hotelAmount: number;             // 酒店金额
  hotelCount: number;              // 酒店订单数
  flightAmount: number;            // 机票金额
  flightCount: number;             // 机票订单数
  trainAmount: number;             // 火车票金额
  trainCount: number;              // 火车票订单数
  
  // 时间信息
  createTime: string;              // 生成时间 ISO 8601
  confirmTime: string | null;      // 确认时间
  settleTime: string | null;       // 结清时间
  
  // 关联信息
  postBillNo: string | null;       // 后结账单编号
  financeBillNo: string | null;    // 财务账单编号
  
  // 企业属性
  accountType: number;             // 账户类型 1-预存 2-授信
  appId: string;                   // 易快报企业ID
}
```

---

### 2.2 OrderDetail（订单明细）

**接口**: `GET /api/bills/{billNo}/orders`

```typescript
interface OrderDetailListResponse {
  status: string;
  message: string;
  data: {
    list: OrderDetail[];
    total: number;
    pageNum: number;
    pageSize: number;
  };
}

interface OrderDetail {
  // 订单基础信息
  orderNo: string;                 // 订单号
  endorseNo: string;               // 原始订单号
  businessType: string;            // 业务类型 001-酒店 002-机票 003-火车
  atomId: string;                  // 原子ID
  
  // 出行信息
  travelerName: string;            // 出行人姓名
  bookerName: string;              // 预订人姓名
  haveTraveled: boolean;           // 是否出行
  departTime: string;              // 出发时间
  arriveTime: string;              // 到达时间
  travelTime: string;              // 出行时间
  
  // 财务信息
  payAmount: number;               // 支付金额（元）
  payTime: string;                 // 支付时间
  orderTime: string;               // 订单时间
  costCenter: string;              // 成本中心
  costUnderDep: string;            // 成本归属部门
  legalEntity: string;             // 法人实体
  
  // 发票信息
  invoiceTitle: string;            // 发票抬头
  taxpayerIdentificationNumber: string;  // 纳税人识别号
  checkStatus: boolean;            // 核对状态
  
  // 供应商信息
  productProvider: string;         // 供应商
  channelProductName: string;      // 渠道产品类型
  category: string;                // 出行类别
  
  // 扩展信息
  groupName: string;               // 集团名称（酒店）
  ticketNo: string;                // 票号
  
  // 业务线特有字段（根据businessType显示）
  hotelInfo?: {
    hotelName: string;             // 酒店名称
    checkInDate: string;           // 入住日期
    checkOutDate: string;          // 离店日期
    roomType: string;              // 房型
  };
  flightInfo?: {
    flightNo: string;              // 航班号
    departure: string;             // 出发地
    destination: string;           // 目的地
    cabin: string;                 // 舱位
  };
  trainInfo?: {
    trainNo: string;               // 车次
    departure: string;             // 出发站
    destination: string;           // 到达站
    seatType: string;              // 座位类型
  };
}
```

---

### 2.3 Invoice（发票）

**接口**: `GET /api/invoices`

```typescript
interface InvoiceListResponse {
  status: string;
  message: string;
  data: {
    list: Invoice[];
    total: number;
  };
}

interface Invoice {
  // 发票基础信息
  invoiceNo: string;               // 发票号
  invoiceType: string;             // 发票类型 001-专票 002-普票 003-行程单 004-火车票
  invoiceCategory: string;         // 开票类目
  
  // 开票主体
  buyInvoiceHeader: string;        // 购方抬头
  buyTaxNumber: string;            // 购方税号
  sellerInfo: {
    name: string;                  // 销方名称
    taxNumber: string;             // 销方税号
    address: string;               // 销方地址
    phone: string;                 // 销方电话
    bank: string;                  // 销方开户行
    account: string;               // 销方账号
  };
  
  // 金额信息
  invoiceAmount: number;           // 发票金额（元）
  invoiceAmountType: string;       // 金额类型
  taxAmount: number;               // 税额
  totalAmount: number;             // 价税合计
  
  // 状态信息
  invoiceStatus: number;           // 开票状态 0-开票中 1-开票成功 2-开票失败
  shippingStatus: number;          // 邮寄状态 0-未邮寄 1-已邮寄
  redReversalStatus: number;       // 红冲状态 0-未红冲 1-已红冲
  
  // 时间信息
  invoiceTime: string;             // 开具时间
  shippingTime: string | null;    // 邮寄时间
  redReversalTime: string | null;  // 红冲时间
  
  // 文件信息
  invoiceFileUrl: string;          // 发票文件URL
  downloadLink: string;            // 下载链接（带签名）
  fileFormat: string;              // 文件格式 PDF/OFD
  fileSize: number;                // 文件大小（字节）
  
  // 关联信息
  orderList: string[];             // 关联订单列表
  batchId: string;                 // 所属批次
  billNo: string;                  // 关联账单
  originalInvoiceNo: string | null;  // 原始发票号（红冲场景）
}
```

---

### 2.4 InvoiceBatch（开票批次）

**接口**: `POST /api/invoices/apply`

```typescript
interface InvoiceApplyRequest {
  billNo: string;                  // 账单编号
  operateType: string;             // 操作类型 'normal' | 'train'
  scope: number;                   // 开票范围 1-指定企业+日期区间 2-指定数据 3-账单编号
  
  // 企业信息
  companyId?: string;              // 企业ID
  companyAppId?: string;           // 易快报企业ID
  
  // 时间范围（scope=1时必填）
  dateType?: number;               // 日期口径 0-支付时间 1-出行时间 2-支付时间+出行时间
  payDateRange?: [string, string]; // 支付时间区间
  travelDateRange?: [string, string];  // 出行时间区间
  
  // 发票配置
  buyInvoiceHeader: string;        // 购方抬头
  buyTaxNumber: string;            // 购方税号
  defaultInvoiceHeaderType: number;  // 抬头类型 1-统一抬头 2-按账单标识
  titleType: number;               // 抬头选择方式 1-读取配置 2-自行填写 3-唯一抬头
  
  // 收货信息
  receiverName: string;            // 收货人
  receiverPhone: string;           // 收货电话
  receiverAddress: string;         // 收货地址
  
  // 数据范围（scope=2时必填）
  dataScope?: string;              // 数据类型 'billId' | 'atomId' | 'ticketNo'
  fileUrl?: string;                // 上传文件URL
}

interface InvoiceApplyResponse {
  status: string;
  message: string;
  data: {
    batchId: string;               // 批次号
    expectedInvoiceCount: number;  // 预计开票数量
  };
}

interface InvoiceBatch {
  batchId: string;                 // 批次号
  billNo: string;                  // 关联账单
  companyId: string;               // 企业ID
  companyName: string;             // 企业名称
  
  // 批次状态
  batchStatus: number;             // 0-待拆分 1-拆分中 2-拆分完成 3-开票中 4-开票完成 5-开票失败
  
  // 操作信息
  operateType: string;             // 'normal' | 'train'
  scope: number;                   // 开票范围
  
  // 统计信息
  expectedInvoiceCount: number;    // 预计开票数量
  actualInvoiceCount: number;      // 实际开票数量
  
  // 发票汇总
  totalAmount: number;             // 应开发票金额
  invoicedAmount: number;          // 已开发票金额
  vatCount: number;                // 专票数量
  vatAmount: number;               // 专票金额
  generalCount: number;            // 普票数量
  generalAmount: number;           // 普票金额
  itineraryCount: number;          // 行程单数量
  itineraryAmount: number;         // 行程单金额
  
  // 时间信息
  createTime: string;              // 创建时间
  finishTime: string | null;       // 完成时间
  splitDuration: number | null;    // 拆分耗时（秒）
  
  // 错误信息
  errorMessage: string | null;     // 失败原因
}
```

---

### 2.5 User（用户）

**接口**: `GET /api/auth/userinfo`

```typescript
interface UserInfoResponse {
  status: string;
  message: string;
  data: UserInfo;
}

interface UserInfo {
  userId: string;                  // 用户ID
  username: string;                // 用户名
  name: string;                    // 姓名
  role: string;                    // 角色
  
  // 企业信息
  companyId: string;               // 企业ID
  companyName: string;             // 企业名称
  creditCode: string;              // 统一社会信用代码
  accountType: number;             // 账户类型 1-预存 2-授信
  appId: string;                   // 易快报企业ID
  
  // 权限信息
  permissions: string[];           // 权限列表
  dataScope: string;               // 数据权限范围
  
  // 企业配置
  companyConfig: {
    defaultInvoiceHeader: string;  // 默认发票抬头
    defaultTaxpayerNumber: string; // 默认纳税人识别号
    addressList: Address[];        // 收货地址列表
    settleManager: {               // 结算人员信息
      name: string;
      phone: string;
      email: string;
    };
  };
  
  // 登录信息
  loginType: string;               // 登录方式 'email' | 'sso'
  lastLoginTime: string;           // 最后登录时间
}

interface Address {
  addressId: string;               // 地址ID
  receiverName: string;            // 收货人
  phone: string;                   // 联系电话
  province: string;                // 省份
  city: string;                    // 城市
  district: string;                // 区县
  address: string;                 // 详细地址
  isDefault: boolean;              // 是否默认地址
}
```

---

## 3. 表单数据模型

### 3.1 InvoiceApplicationForm（发票申请表单）

**组件**: `views/invoice/Apply.vue`

```typescript
interface InvoiceApplicationForm {
  billNo: string;                  // 账单编号（必填）
  
  // 购方信息
  buyInvoiceHeader: string;        // 购方抬头（必填）
  buyTaxNumber: string;            // 购方税号（必填，18位）
  
  // 收货信息
  addressId: string;               // 地址ID（选择已有地址）
  receiverName: string;            // 收货人（必填）
  receiverPhone: string;           // 收货电话（必填，手机号格式）
  province: string;                // 省份（必填）
  city: string;                    // 城市（必填）
  district: string;                // 区县
  address: string;                 // 详细地址（必填）
  
  // 备注
  remark: string;                  // 备注
}

// 表单验证规则
const rules = {
  buyInvoiceHeader: [
    { required: true, message: '请输入购方抬头', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在2到100个字符', trigger: 'blur' }
  ],
  buyTaxNumber: [
    { required: true, message: '请输入纳税人识别号', trigger: 'blur' },
    { pattern: /^[A-Z0-9]{15}$|^[A-Z0-9]{18}$|^[A-Z0-9]{20}$/, message: '纳税人识别号格式不正确', trigger: 'blur' }
  ],
  receiverName: [
    { required: true, message: '请输入收货人', trigger: 'blur' }
  ],
  receiverPhone: [
    { required: true, message: '请输入收货电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在5到200个字符', trigger: 'blur' }
  ]
};
```

---

### 3.2 OrderAdjustmentForm（订单调整表单）

**组件**: `views/bill/Adjust.vue`

**权限**: 仅预存企业可用

```typescript
interface OrderAdjustmentForm {
  orderNos: string[];              // 订单号列表（必填，批量调整）
  
  // 可调整字段
  costCenter?: string;             // 成本中心
  costUnderDep?: string;           // 成本归属部门
  invoiceTitle?: string;           // 发票抬头
  
  // 调整原因
  adjustReason: string;            // 调整原因（必填）
}

// 表单验证规则
const rules = {
  orderNos: [
    { required: true, message: '请选择要调整的订单', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个订单', trigger: 'change' }
  ],
  adjustReason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在5到200个字符', trigger: 'blur' }
  ]
};
```

---

### 3.3 SearchFilterForm（搜索筛选表单）

**组件**: `views/bill/List.vue` 和 `views/invoice/List.vue`

```typescript
// 账单列表筛选
interface BillSearchForm {
  billCycle: string;               // 账单周期 YYYY-MM
  billStatus: number | null;       // 账单状态
  dateRange: [string, string] | null;  // 日期范围
}

// 订单明细筛选
interface OrderSearchForm {
  businessType: string;            // 业务类型 '001' | '002' | '003'
  travelerName: string;            // 出行人姓名（模糊搜索）
  dateRange: [string, string] | null;  // 日期范围
  checkStatus: boolean | null;     // 核对状态
  costCenter: string;              // 成本中心
}

// 发票列表筛选
interface InvoiceSearchForm {
  invoiceType: string;             // 发票类型
  invoiceStatus: number | null;    // 发票状态
  dateRange: [string, string] | null;  // 开票日期范围
  invoiceNo: string;               // 发票号（精确搜索）
}
```

---

## 4. 常量和枚举

### 4.1 业务类型枚举

**路径**: `src/utils/constants.js`

```javascript
// 业务类型
export const BUSINESS_TYPE = {
  HOTEL: '001',
  FLIGHT: '002',
  TRAIN: '003',
  CAR: '004',
  FOOD: '005',
  GENERAL: '007',
  INSURANCE: '008'
};

export const BUSINESS_TYPE_MAP = {
  '001': '酒店',
  '002': '机票',
  '003': '火车',
  '004': '用车',
  '005': '餐饮',
  '007': '通用',
  '008': '保险'
};
```

---

### 4.2 账单状态枚举

```javascript
// 账单状态
export const BILL_STATUS = {
  PENDING: 0,        // 待对账
  CONFIRMED: 1,      // 对账完成
  INVOICING: 2,      // 开票中
  SETTLED: 3         // 已结清
};

export const BILL_STATUS_MAP = {
  0: '待对账',
  1: '对账完成',
  2: '开票中',
  3: '已结清'
};

export const BILL_STATUS_COLOR = {
  0: 'warning',
  1: 'success',
  2: 'primary',
  3: 'info'
};
```

---

### 4.3 发票类型枚举

```javascript
// 发票类型
export const INVOICE_TYPE = {
  VAT_SPECIAL: '001',    // 增值税专用发票
  VAT_GENERAL: '002',    // 增值税普通发票
  ITINERARY: '003',      // 电子行程单
  TRAIN_TICKET: '004'    // 火车票
};

export const INVOICE_TYPE_MAP = {
  '001': '增值税专用发票',
  '002': '增值税普通发票',
  '003': '电子行程单',
  '004': '火车票'
};

export const INVOICE_TYPE_SHORT = {
  '001': '专票',
  '002': '普票',
  '003': '行程单',
  '004': '火车票'
};
```

---

### 4.4 发票状态枚举

```javascript
// 发票状态
export const INVOICE_STATUS = {
  PROCESSING: 0,     // 开票中
  SUCCESS: 1,        // 开票成功
  FAILED: 2          // 开票失败
};

export const INVOICE_STATUS_MAP = {
  0: '开票中',
  1: '开票成功',
  2: '开票失败'
};

export const INVOICE_STATUS_COLOR = {
  0: 'primary',
  1: 'success',
  2: 'danger'
};
```

---

### 4.5 批次状态枚举

```javascript
// 批次状态
export const BATCH_STATUS = {
  PENDING_SPLIT: 0,      // 待拆分
  SPLITTING: 1,          // 拆分中
  SPLIT_COMPLETE: 2,     // 拆分完成
  SPLIT_FAILED: 3,       // 拆分失败
  INVOICING: 4,          // 开票中
  INVOICE_COMPLETE: 5,   // 开票完成
  INVOICE_FAILED: 6      // 开票失败
};

export const BATCH_STATUS_MAP = {
  0: '待拆分',
  1: '拆分中',
  2: '拆分完成',
  3: '拆分失败',
  4: '开票中',
  5: '开票完成',
  6: '开票失败'
};
```

---

### 4.6 账户类型枚举

```javascript
// 账户类型
export const ACCOUNT_TYPE = {
  PRE_PAID: 1,           // 预存
  CREDIT: 2              // 授信
};

export const ACCOUNT_TYPE_MAP = {
  1: '预存',
  2: '授信'
};
```

---

### 4.7 权限枚举

```javascript
// 权限标识
export const PERMISSIONS = {
  // 账单权限
  BILL_VIEW: 'bill:view',
  BILL_CONFIRM: 'bill:confirm',
  BILL_EXPORT: 'bill:export',
  BILL_ADJUST: 'bill:adjust',           // 仅预存企业
  
  // 发票权限
  INVOICE_VIEW: 'invoice:view',
  INVOICE_APPLY: 'invoice:apply',
  INVOICE_DOWNLOAD: 'invoice:download',
  
  // 用户权限
  USER_PROFILE: 'user:profile'
};
```

---

## 5. 数据关系图

### 5.1 核心实体关系

```
┌──────────────┐
│   Enterprise │  企业
└───────┬──────┘
        │ 1:N
        │
┌───────▼──────┐
│     User     │  用户
└──────────────┘
        │
        │ 1:N
        │
┌───────▼──────────┐       1:N      ┌─────────────────┐
│  BillPackage     ├─────────────────▶  OrderDetail    │
│  (账单包)        │                 │  (订单明细)     │
└───────┬──────────┘                 └─────────────────┘
        │                                     │
        │ 1:N                                 │ N:M
        │                                     │
┌───────▼──────────┐       1:N      ┌────────▼─────────┐
│  InvoiceBatch    ├─────────────────▶  Invoice        │
│  (开票批次)      │                 │  (发票)         │
└──────────────────┘                 └──────────────────┘
```

### 5.2 状态流转图

**账单包状态流转**:

```
待对账 (0) ──[企业确认]──▶ 对账完成 (1) ──[申请开票]──▶ 开票中 (2) ──[付款确认]──▶ 已结清 (3)
                                                              │
                                                              │ [开票失败]
                                                              ▼
                                                          对账完成 (1)
```

**开票批次状态流转**:

```
待拆分 (0) ──▶ 拆分中 (1) ──▶ 拆分完成 (2) ──▶ 开票中 (4) ──▶ 开票完成 (5)
                │                                    │
                │ [失败]                             │ [失败]
                ▼                                    ▼
             拆分失败 (3)                        开票失败 (6)
```

---

## 6. 数据转换规则

### 6.1 API响应转换为Vuex State

**示例**: BillPackage API → Vuex State

```javascript
// API响应
const apiResponse = {
  billNo: 'BILL202601001',
  billCycle: '2026-01',
  billStatus: 0,
  totalAmount: 125000.50,
  hotelAmount: 50000,
  hotelCount: 20,
  flightAmount: 60000.50,
  flightCount: 15,
  trainAmount: 15000,
  trainCount: 10
};

// 转换为Vuex State
const vuexState = {
  billNo: apiResponse.billNo,
  billCycle: apiResponse.billCycle,
  billStatus: apiResponse.billStatus,
  billStatusText: BILL_STATUS_MAP[apiResponse.billStatus],  // '待对账'
  totalAmount: apiResponse.totalAmount,
  totalOrderCount: apiResponse.hotelCount + apiResponse.flightCount + apiResponse.trainCount,  // 45
  businessSummary: {
    hotel: {
      amount: apiResponse.hotelAmount,
      count: apiResponse.hotelCount
    },
    flight: {
      amount: apiResponse.flightAmount,
      count: apiResponse.flightCount
    },
    train: {
      amount: apiResponse.trainAmount,
      count: apiResponse.trainCount
    }
  }
};
```

---

### 6.2 金额格式化

```javascript
// 工具函数：src/utils/format.js

/**
 * 格式化金额（元）
 * @param {number} amount - 金额（元）
 * @param {number} precision - 小数位数，默认2
 * @returns {string} 格式化后的金额，如 '125,000.50'
 */
export function formatAmount(amount, precision = 2) {
  if (amount === null || amount === undefined) return '-';
  return amount.toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化金额（带单位）
 * @param {number} amount - 金额（元）
 * @returns {string} 格式化后的金额，如 '¥ 125,000.50'
 */
export function formatAmountWithUnit(amount) {
  if (amount === null || amount === undefined) return '-';
  return `¥ ${formatAmount(amount)}`;
}
```

---

### 6.3 日期格式化

```javascript
// 工具函数：src/utils/format.js
import moment from 'moment';

/**
 * 格式化日期时间
 * @param {string} dateTime - ISO 8601 格式日期时间
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间
 */
export function formatDateTime(dateTime, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateTime) return '-';
  return moment(dateTime).format(format);
}

/**
 * 格式化日期
 * @param {string} date - ISO 8601 格式日期
 * @returns {string} 格式化后的日期，如 '2026-01-15'
 */
export function formatDate(date) {
  return formatDateTime(date, 'YYYY-MM-DD');
}

/**
 * 格式化时间
 * @param {string} time - ISO 8601 格式时间
 * @returns {string} 格式化后的时间，如 '14:30:00'
 */
export function formatTime(time) {
  return formatDateTime(time, 'HH:mm:ss');
}
```

---

## 总结

本数据模型文档定义了compMOS前端系统的所有数据结构，包括：

1. **Vuex状态模型**：定义了User、Bill、Invoice三个核心模块的状态结构
2. **API数据模型**：定义了与MOS后台交互的数据格式
3. **表单数据模型**：定义了用户输入表单的数据结构和验证规则
4. **常量和枚举**：定义了业务类型、状态等枚举值
5. **数据关系图**：展示了核心实体之间的关系和状态流转
6. **数据转换规则**：定义了API响应与前端状态之间的转换逻辑

所有数据模型均与[spec.md](./spec.md)中的Key Entities保持一致，遵循[research.md](./research.md)中确定的技术方案。

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-15  
**Status**: ✅ Data Model Complete

