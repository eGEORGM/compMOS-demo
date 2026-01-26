# Mock Data Design: Demo原型模拟数据

**Feature**: 结算平台Demo原型  
**Date**: 2026-01-16  
**Phase**: 0 - Mock Data Design  
**Related**: [plan.md](./plan.md) | [spec.md](./spec.md)

本文档定义demo原型的所有模拟数据结构和生成规则。

---

## 目录

1. [数据概览](#1-数据概览)
2. [账单包数据](#2-账单包数据)
3. [订单明细数据](#3-订单明细数据)
4. [发票数据](#4-发票数据)
5. [用户数据](#5-用户数据)
6. [常量和枚举](#6-常量和枚举)
7. [数据生成脚本](#7-数据生成脚本)

---

## 1. 数据概览

### 数据规模

| 数据类型 | 数量 | 说明 |
|---------|------|------|
| 账单包 | 4个 | 涵盖4种状态（待对账、已核对、开票中、已结清） |
| 订单明细 | 150条 | 分布在4个账单包中（30-50条/包） |
| 发票 | 20张 | 分布在2个已完成的开票批次中 |
| 开票批次 | 3个 | 1个开票中、2个已完成 |
| 模拟用户 | 2个 | 1个预存企业、1个授信企业 |
| 收货地址 | 3个 | 企业预置地址 |

### 数据关系图

```
用户（User）
  └─ 企业类型（accountType: 1预存/2授信）
      └─ 权限控制

账单包（BillPackage）
  ├─ 订单明细（OrderDetail）[1:N]
  └─ 开票批次（InvoiceBatch）[1:N]
      └─ 发票（Invoice）[1:N]
```

---

## 2. 账单包数据

### 数据结构

```javascript
{
  billNo: String,              // 账单编号（唯一）
  billCycle: String,           // 账单周期 YYYY-MM
  billStatus: Number,          // 账单状态 0-待对账 1-已核对 2-开票中 3-已结清
  totalAmount: Number,         // 总金额（元）
  totalOrderCount: Number,     // 总订单数
  
  // 各业务线汇总
  hotelAmount: Number,         // 酒店金额
  hotelCount: Number,          // 酒店订单数
  flightAmount: Number,        // 机票金额
  flightCount: Number,         // 机票订单数
  trainAmount: Number,         // 火车票金额
  trainCount: Number,          // 火车票订单数
  
  // 时间信息
  createTime: String,          // 生成时间 ISO 8601
  confirmTime: String | null,  // 确认时间
  settleTime: String | null,   // 结清时间
  
  // 企业信息
  companyName: String,         // 企业名称
  accountType: Number          // 账户类型 1-预存 2-授信
}
```

### 模拟数据（bills.js）

```javascript
export const mockBills = [
  {
    billNo: 'BILL202601001',
    billCycle: '2026-01',
    billStatus: 0, // 待对账
    totalAmount: 125350.50,
    totalOrderCount: 45,
    hotelAmount: 48200.00,
    hotelCount: 18,
    flightAmount: 62150.50,
    flightCount: 17,
    trainAmount: 15000.00,
    trainCount: 10,
    createTime: '2026-01-01T00:00:00Z',
    confirmTime: null,
    settleTime: null,
    companyName: '示例科技有限公司',
    accountType: 1
  },
  {
    billNo: 'BILL202512001',
    billCycle: '2025-12',
    billStatus: 1, // 已核对
    totalAmount: 89600.00,
    totalOrderCount: 32,
    hotelAmount: 35000.00,
    hotelCount: 15,
    flightAmount: 42300.00,
    flightCount: 12,
    trainAmount: 12300.00,
    trainCount: 5,
    createTime: '2025-12-01T00:00:00Z',
    confirmTime: '2025-12-05T14:30:00Z',
    settleTime: null,
    companyName: '示例科技有限公司',
    accountType: 1
  },
  {
    billNo: 'BILL202511001',
    billCycle: '2025-11',
    billStatus: 2, // 开票中
    totalAmount: 156800.00,
    totalOrderCount: 50,
    hotelAmount: 58000.00,
    hotelCount: 22,
    flightAmount: 78800.00,
    flightCount: 20,
    trainAmount: 20000.00,
    trainCount: 8,
    createTime: '2025-11-01T00:00:00Z',
    confirmTime: '2025-11-03T10:15:00Z',
    settleTime: null,
    companyName: '示例科技有限公司',
    accountType: 1
  },
  {
    billNo: 'BILL202510001',
    billCycle: '2025-10',
    billStatus: 3, // 已结清
    totalAmount: 102400.00,
    totalOrderCount: 38,
    hotelAmount: 42000.00,
    hotelCount: 16,
    flightAmount: 48400.00,
    flightCount: 15,
    trainAmount: 12000.00,
    trainCount: 7,
    createTime: '2025-10-01T00:00:00Z',
    confirmTime: '2025-10-04T09:20:00Z',
    settleTime: '2025-10-15T16:45:00Z',
    companyName: '示例科技有限公司',
    accountType: 1
  }
];
```

---

## 3. 订单明细数据

### 数据结构

```javascript
{
  orderNo: String,             // 订单号（唯一）
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
  ticketNo: String,            // 票号
  
  // 业务线特有字段
  businessInfo: Object         // 根据businessType不同而不同
}
```

### 模拟数据示例（orders.js）

#### BILL202601001的订单（待对账）

```javascript
export const mockOrders = {
  'BILL202601001': [
    // 机票订单
    {
      orderNo: 'ORDER2026010100001',
      businessType: '002',
      travelerName: '张三',
      bookerName: '李四',
      payAmount: 3500.00,
      payTime: '2026-01-05T10:30:00Z',
      travelTime: '2026-01-10T08:00:00Z',
      checkStatus: false,
      costCenter: '技术部',
      costUnderDep: '研发中心',
      invoiceTitle: '示例科技有限公司',
      productProvider: '东方航空',
      ticketNo: 'MU123456789',
      businessInfo: {
        flightNo: 'MU5123',
        departure: '上海虹桥',
        destination: '北京首都',
        cabin: '经济舱'
      }
    },
    {
      orderNo: 'ORDER2026010100002',
      businessType: '002',
      travelerName: '王五',
      bookerName: '李四',
      payAmount: 2800.00,
      payTime: '2026-01-06T14:20:00Z',
      travelTime: '2026-01-12T14:30:00Z',
      checkStatus: false,
      costCenter: '销售部',
      costUnderDep: '销售中心',
      invoiceTitle: '示例科技有限公司',
      productProvider: '南方航空',
      ticketNo: 'CZ987654321',
      businessInfo: {
        flightNo: 'CZ3456',
        departure: '广州白云',
        destination: '深圳宝安',
        cabin: '经济舱'
      }
    },
    
    // 火车票订单
    {
      orderNo: 'ORDER2026010100003',
      businessType: '003',
      travelerName: '赵六',
      bookerName: '李四',
      payAmount: 550.50,
      payTime: '2026-01-07T09:10:00Z',
      travelTime: '2026-01-15T07:00:00Z',
      checkStatus: false,
      costCenter: '技术部',
      costUnderDep: '研发中心',
      invoiceTitle: '示例科技有限公司',
      productProvider: '中国铁路',
      ticketNo: 'D12345678',
      businessInfo: {
        trainNo: 'D123',
        departure: '北京南',
        destination: '上海虹桥',
        seatType: '二等座'
      }
    },
    
    // 酒店订单
    {
      orderNo: 'ORDER2026010100004',
      businessType: '001',
      travelerName: '孙七',
      bookerName: '李四',
      payAmount: 1280.00,
      payTime: '2026-01-08T16:45:00Z',
      travelTime: '2026-01-20T14:00:00Z',
      checkStatus: false,
      costCenter: '市场部',
      costUnderDep: '市场中心',
      invoiceTitle: '示例科技有限公司',
      productProvider: '如家酒店',
      ticketNo: 'HTL20260108001',
      businessInfo: {
        hotelName: '如家酒店（北京朝阳门店）',
        checkInDate: '2026-01-20',
        checkOutDate: '2026-01-22',
        roomType: '商务大床房'
      }
    },
    
    // ...更多订单（共45条）
    // 使用Mock.js生成剩余订单以节省篇幅
  ],
  
  'BILL202512001': [
    // 32条订单（状态：已核对）
    // 数据结构同上，checkStatus全部为true
  ],
  
  'BILL202511001': [
    // 50条订单（状态：开票中）
  ],
  
  'BILL202510001': [
    // 38条订单（状态：已结清）
  ]
};
```

### 订单数据生成规则

使用Mock.js生成批量订单数据的模板：

```javascript
import Mock from 'mockjs';

// 生成单个订单
function generateOrder(billNo, index, businessType) {
  return Mock.mock({
    orderNo: `ORDER${billNo.replace('BILL', '')}${String(index).padStart(5, '0')}`,
    businessType: businessType,
    'travelerName': '@cname',
    'bookerName': '李四',
    'payAmount|1000-5000.2': 1,
    payTime: '@datetime("yyyy-MM-ddTHH:mm:ssZ")',
    travelTime: '@datetime("yyyy-MM-ddTHH:mm:ssZ")',
    checkStatus: false,
    'costCenter|1': ['技术部', '销售部', '市场部', '行政部', '财务部'],
    'costUnderDep|1': ['研发中心', '销售中心', '市场中心', '行政中心', '财务中心'],
    invoiceTitle: '示例科技有限公司',
    'productProvider|1': businessType === '002' ? ['东方航空', '南方航空', '国航', '海航'] 
                        : businessType === '003' ? ['中国铁路'] 
                        : ['如家酒店', '汉庭酒店', '7天连锁', '锦江之星'],
    ticketNo: `${businessType}${Mock.Random.string('number', 10)}`,
    businessInfo: generateBusinessInfo(businessType)
  });
}

// 根据业务类型生成特有信息
function generateBusinessInfo(businessType) {
  if (businessType === '002') { // 机票
    return Mock.mock({
      'flightNo': /[A-Z]{2}\d{4}/,
      'departure|1': ['北京首都', '上海虹桥', '广州白云', '深圳宝安', '成都双流'],
      'destination|1': ['北京首都', '上海虹桥', '广州白云', '深圳宝安', '成都双流'],
      'cabin|1': ['经济舱', '公务舱']
    });
  } else if (businessType === '003') { // 火车票
    return Mock.mock({
      'trainNo': /[GDC]\d{3}/,
      'departure|1': ['北京南', '上海虹桥', '广州南', '深圳北', '成都东'],
      'destination|1': ['北京南', '上海虹桥', '广州南', '深圳北', '成都东'],
      'seatType|1': ['二等座', '一等座', '商务座']
    });
  } else { // 酒店
    return Mock.mock({
      hotelName: '@ctitle(5, 10)酒店',
      checkInDate: '@date("yyyy-MM-dd")',
      checkOutDate: '@date("yyyy-MM-dd")',
      'roomType|1': ['标准间', '商务大床房', '豪华套房']
    });
  }
}
```

---

## 4. 发票数据

### 开票批次数据结构

```javascript
{
  batchId: String,             // 批次号
  billNo: String,              // 关联账单
  batchStatus: Number,         // 0-待拆分 1-拆分中 2-拆分完成 3-开票中 4-开票完成 5-开票失败
  operateType: String,         // 'normal' | 'train'
  createTime: String,          // 创建时间
  finishTime: String | null,   // 完成时间
  expectedInvoiceCount: Number,  // 预计开票数量
  actualInvoiceCount: Number,    // 实际开票数量
  
  // 发票汇总
  totalAmount: Number,         // 应开发票金额
  invoicedAmount: Number,      // 已开发票金额
  vatCount: Number,            // 专票数量
  vatAmount: Number,           // 专票金额
  generalCount: Number,        // 普票数量
  generalAmount: Number,       // 普票金额
  itineraryCount: Number,      // 行程单数量
  itineraryAmount: Number      // 行程单金额
}
```

### 发票数据结构

```javascript
{
  invoiceNo: String,           // 发票号
  invoiceType: String,         // 001-专票 002-普票 003-行程单 004-火车票
  invoiceAmount: Number,       // 发票金额（元）
  buyInvoiceHeader: String,    // 购方抬头
  buyTaxNumber: String,        // 购方税号
  invoiceStatus: Number,       // 0-开票中 1-开票成功 2-开票失败
  invoiceTime: String,         // 开具时间
  batchId: String,             // 所属批次
  billNo: String,              // 关联账单
  orderList: Array<String>     // 关联订单列表
}
```

### 模拟数据（invoices.js）

```javascript
export const mockInvoiceBatches = [
  {
    batchId: 'BATCH202511001',
    billNo: 'BILL202511001',
    batchStatus: 3, // 开票中
    operateType: 'normal',
    createTime: '2025-11-05T10:00:00Z',
    finishTime: null,
    expectedInvoiceCount: 8,
    actualInvoiceCount: 0,
    totalAmount: 156800.00,
    invoicedAmount: 0,
    vatCount: 0,
    vatAmount: 0,
    generalCount: 0,
    generalAmount: 0,
    itineraryCount: 0,
    itineraryAmount: 0
  },
  {
    batchId: 'BATCH202510001',
    billNo: 'BILL202510001',
    batchStatus: 4, // 开票完成
    operateType: 'normal',
    createTime: '2025-10-06T09:00:00Z',
    finishTime: '2025-10-06T09:30:00Z',
    expectedInvoiceCount: 7,
    actualInvoiceCount: 7,
    totalAmount: 102400.00,
    invoicedAmount: 102400.00,
    vatCount: 2,
    vatAmount: 30000.00,
    generalCount: 3,
    generalAmount: 52400.00,
    itineraryCount: 2,
    itineraryAmount: 20000.00
  }
];

export const mockInvoices = [
  // BATCH202510001的发票（已完成）
  {
    invoiceNo: 'INV20251006001',
    invoiceType: '001', // 专票
    invoiceAmount: 15000.00,
    buyInvoiceHeader: '示例科技有限公司',
    buyTaxNumber: '91110000123456789X',
    invoiceStatus: 1,
    invoiceTime: '2025-10-06T09:15:00Z',
    batchId: 'BATCH202510001',
    billNo: 'BILL202510001',
    orderList: ['ORDER2025100100001', 'ORDER2025100100002', 'ORDER2025100100003']
  },
  {
    invoiceNo: 'INV20251006002',
    invoiceType: '001', // 专票
    invoiceAmount: 15000.00,
    buyInvoiceHeader: '示例科技有限公司',
    buyTaxNumber: '91110000123456789X',
    invoiceStatus: 1,
    invoiceTime: '2025-10-06T09:16:00Z',
    batchId: 'BATCH202510001',
    billNo: 'BILL202510001',
    orderList: ['ORDER2025100100004', 'ORDER2025100100005']
  },
  {
    invoiceNo: 'INV20251006003',
    invoiceType: '002', // 普票
    invoiceAmount: 18000.00,
    buyInvoiceHeader: '示例科技有限公司',
    buyTaxNumber: '91110000123456789X',
    invoiceStatus: 1,
    invoiceTime: '2025-10-06T09:18:00Z',
    batchId: 'BATCH202510001',
    billNo: 'BILL202510001',
    orderList: ['ORDER2025100100006', 'ORDER2025100100007', 'ORDER2025100100008']
  },
  // ...更多发票（共7张）
];
```

---

## 5. 用户数据

### 数据结构

```javascript
{
  userId: String,              // 用户ID
  username: String,            // 用户名
  name: String,                // 姓名
  companyId: String,           // 企业ID
  companyName: String,         // 企业名称
  accountType: Number,         // 账户类型 1-预存 2-授信
  permissions: Array<String>,  // 权限列表
  
  // 企业配置
  companyConfig: {
    defaultInvoiceHeader: String,     // 默认发票抬头
    defaultTaxpayerNumber: String,    // 默认纳税人识别号
    addressList: Array<Address>,      // 收货地址列表
    settleManager: {                  // 结算人员信息
      name: String,
      phone: String,
      email: String
    }
  }
}
```

### 模拟数据（users.js）

```javascript
export const mockUsers = [
  {
    userId: 'USER001',
    username: 'zhangsan',
    name: '张三',
    companyId: 'COMP001',
    companyName: '示例科技有限公司',
    accountType: 1, // 预存
    permissions: [
      'bill:view',
      'bill:confirm',
      'bill:export',
      'bill:adjust',  // 预存企业独有
      'invoice:view',
      'invoice:apply',
      'invoice:download'
    ],
    companyConfig: {
      defaultInvoiceHeader: '示例科技有限公司',
      defaultTaxpayerNumber: '91110000123456789X',
      addressList: [
        {
          addressId: 'ADDR001',
          receiverName: '王经理',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          address: '建国路88号SOHO现代城A座10层',
          isDefault: true
        },
        {
          addressId: 'ADDR002',
          receiverName: '李经理',
          phone: '13900139000',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          address: '世纪大道100号环球金融中心20层',
          isDefault: false
        },
        {
          addressId: 'ADDR003',
          receiverName: '财务部',
          phone: '13700137000',
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          address: '科技园南路15号科兴科学园B栋8层',
          isDefault: false
        }
      ],
      settleManager: {
        name: '赵结算',
        phone: '13600136000',
        email: 'zhao.jiesuan@example.com'
      }
    }
  },
  {
    userId: 'USER002',
    username: 'lisi',
    name: '李四',
    companyId: 'COMP002',
    companyName: '授信企业示例有限公司',
    accountType: 2, // 授信
    permissions: [
      'bill:view',
      'bill:confirm',
      'bill:export',
      // 无 'bill:adjust' 权限
      'invoice:view',
      'invoice:apply',
      'invoice:download'
    ],
    companyConfig: {
      defaultInvoiceHeader: '授信企业示例有限公司',
      defaultTaxpayerNumber: '91310000987654321A',
      addressList: [
        {
          addressId: 'ADDR004',
          receiverName: '财务部',
          phone: '13500135000',
          province: '上海市',
          city: '上海市',
          district: '黄浦区',
          address: '南京东路100号商务大厦15层',
          isDefault: true
        }
      ],
      settleManager: {
        name: '钱结算',
        phone: '13400134000',
        email: 'qian.jiesuan@example.com'
      }
    }
  }
];
```

---

## 6. 常量和枚举

### constants.js

```javascript
// 业务类型
export const BUSINESS_TYPE = {
  HOTEL: '001',
  FLIGHT: '002',
  TRAIN: '003'
};

export const BUSINESS_TYPE_MAP = {
  '001': '酒店',
  '002': '机票',
  '003': '火车'
};

// 账单状态
export const BILL_STATUS = {
  PENDING: 0,
  CONFIRMED: 1,
  INVOICING: 2,
  SETTLED: 3
};

export const BILL_STATUS_MAP = {
  0: '待对账',
  1: '已核对',
  2: '开票中',
  3: '已结清'
};

export const BILL_STATUS_COLOR = {
  0: 'warning',
  1: 'success',
  2: 'primary',
  3: 'info'
};

// 发票类型
export const INVOICE_TYPE = {
  VAT_SPECIAL: '001',
  VAT_GENERAL: '002',
  ITINERARY: '003',
  TRAIN_TICKET: '004'
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

// 账户类型
export const ACCOUNT_TYPE = {
  PRE_PAID: 1,
  CREDIT: 2
};

export const ACCOUNT_TYPE_MAP = {
  1: '预存',
  2: '授信'
};
```

---

## 7. 数据生成脚本

### 完整Mock数据生成脚本（mockData.js）

```javascript
import Mock from 'mockjs';
import { mockBills } from './bills';
import { mockOrders } from './orders';
import { mockInvoiceBatches, mockInvoices } from './invoices';
import { mockUsers } from './users';

// 配置Mock
Mock.setup({
  timeout: '200-600' // 模拟网络延迟
});

// 获取当前用户（从localStorage读取，默认预存企业）
export function getCurrentUser() {
  const userType = localStorage.getItem('demo_user_type') || '1'; // 1-预存 2-授信
  return mockUsers.find(u => u.accountType === parseInt(userType)) || mockUsers[0];
}

// 获取账单包列表
export function getBillPackages(params = {}) {
  let bills = [...mockBills];
  
  // 筛选
  if (params.billStatus !== undefined) {
    bills = bills.filter(b => b.billStatus === params.billStatus);
  }
  if (params.billCycle) {
    bills = bills.filter(b => b.billCycle === params.billCycle);
  }
  
  // 分页
  const page = params.pageNum || 1;
  const size = params.pageSize || 20;
  const start = (page - 1) * size;
  const end = start + size;
  
  return {
    list: bills.slice(start, end),
    total: bills.length,
    pageNum: page,
    pageSize: size
  };
}

// 获取账单详情
export function getBillDetail(billNo) {
  return mockBills.find(b => b.billNo === billNo);
}

// 获取订单明细
export function getOrderDetails(billNo, params = {}) {
  let orders = mockOrders[billNo] || [];
  
  // 搜索
  if (params.travelerName) {
    orders = orders.filter(o => o.travelerName.includes(params.travelerName));
  }
  
  // 筛选
  if (params.businessType) {
    orders = orders.filter(o => o.businessType === params.businessType);
  }
  if (params.checkStatus !== undefined) {
    orders = orders.filter(o => o.checkStatus === params.checkStatus);
  }
  
  // 分页
  const page = params.pageNum || 1;
  const size = params.pageSize || 50;
  const start = (page - 1) * size;
  const end = start + size;
  
  return {
    list: orders.slice(start, end),
    total: orders.length,
    pageNum: page,
    pageSize: size
  };
}

// 更新订单核对状态
export function updateOrderCheckStatus(billNo, orderNos, checkStatus) {
  const orders = mockOrders[billNo];
  if (!orders) return { success: false, message: '账单不存在' };
  
  let successCount = 0;
  orderNos.forEach(orderNo => {
    const order = orders.find(o => o.orderNo === orderNo);
    if (order) {
      order.checkStatus = checkStatus;
      successCount++;
    }
  });
  
  return {
    success: true,
    successCount,
    failCount: orderNos.length - successCount
  };
}

// 确认账单
export function confirmBill(billNo) {
  const bill = mockBills.find(b => b.billNo === billNo);
  if (!bill) return { success: false, message: '账单不存在' };
  if (bill.billStatus !== 0) return { success: false, message: '账单状态不正确' };
  
  // 检查是否所有订单已核对
  const orders = mockOrders[billNo] || [];
  const allChecked = orders.every(o => o.checkStatus);
  if (!allChecked) return { success: false, message: '请先核对所有订单' };
  
  // 更新账单状态
  bill.billStatus = 1;
  bill.confirmTime = new Date().toISOString();
  
  return { success: true, message: '账单确认成功' };
}

// 申请发票
export function applyInvoice(params) {
  const { billNo, buyInvoiceHeader, buyTaxNumber, receiverName, receiverPhone, receiverAddress } = params;
  
  const bill = mockBills.find(b => b.billNo === billNo);
  if (!bill) return { success: false, message: '账单不存在' };
  if (bill.billStatus !== 1) return { success: false, message: '账单状态不正确' };
  
  // 生成批次
  const batchId = `BATCH${Date.now()}`;
  const newBatch = {
    batchId,
    billNo,
    batchStatus: 3, // 开票中
    operateType: 'normal',
    createTime: new Date().toISOString(),
    finishTime: null,
    expectedInvoiceCount: 8,
    actualInvoiceCount: 0,
    totalAmount: bill.totalAmount,
    invoicedAmount: 0,
    vatCount: 0,
    vatAmount: 0,
    generalCount: 0,
    generalAmount: 0,
    itineraryCount: 0,
    itineraryAmount: 0
  };
  
  mockInvoiceBatches.push(newBatch);
  
  // 更新账单状态
  bill.billStatus = 2; // 开票中
  
  // 模拟3秒后完成开票
  setTimeout(() => {
    newBatch.batchStatus = 4; // 开票完成
    newBatch.finishTime = new Date().toISOString();
    newBatch.actualInvoiceCount = 8;
    newBatch.invoicedAmount = bill.totalAmount;
    newBatch.vatCount = 2;
    newBatch.vatAmount = 30000;
    newBatch.generalCount = 4;
    newBatch.generalAmount = bill.totalAmount - 30000 - 20000;
    newBatch.itineraryCount = 2;
    newBatch.itineraryAmount = 20000;
    
    // 生成发票
    for (let i = 0; i < 8; i++) {
      mockInvoices.push({
        invoiceNo: `INV${Date.now()}${i}`,
        invoiceType: i < 2 ? '001' : i < 6 ? '002' : '003',
        invoiceAmount: i < 2 ? 15000 : i < 6 ? (bill.totalAmount - 30000 - 20000) / 4 : 10000,
        buyInvoiceHeader,
        buyTaxNumber,
        invoiceStatus: 1,
        invoiceTime: new Date().toISOString(),
        batchId,
        billNo,
        orderList: []
      });
    }
  }, 3000);
  
  return { success: true, batchId, expectedInvoiceCount: 8 };
}

// 获取发票批次列表
export function getInvoiceBatches(params = {}) {
  let batches = [...mockInvoiceBatches];
  
  if (params.billNo) {
    batches = batches.filter(b => b.billNo === params.billNo);
  }
  if (params.batchStatus !== undefined) {
    batches = batches.filter(b => b.batchStatus === params.batchStatus);
  }
  
  return {
    list: batches,
    total: batches.length
  };
}

// 获取发票列表
export function getInvoices(params = {}) {
  let invoices = [...mockInvoices];
  
  if (params.batchId) {
    invoices = invoices.filter(i => i.batchId === params.batchId);
  }
  if (params.billNo) {
    invoices = invoices.filter(i => i.billNo === params.billNo);
  }
  
  return {
    list: invoices,
    total: invoices.length
  };
}

// 切换用户类型（demo演示用）
export function switchUserType(accountType) {
  localStorage.setItem('demo_user_type', String(accountType));
  return getCurrentUser();
}
```

---

## 总结

本Mock数据设计文档定义了demo原型的所有模拟数据：

1. **4个账单包**：涵盖4种状态，总计150条订单明细
2. **发票数据**：3个批次，20张发票
3. **2个模拟用户**：预存企业和授信企业，用于权限演示
4. **完整数据生成脚本**：支持筛选、搜索、分页、状态更新等操作

所有数据结构与[001-settlement-automation的data-model.md](../001-settlement-automation/data-model.md)保持一致，确保demo展示的数据格式与最终产品一致。

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16  
**Status**: ✅ Mock Data Design Complete

