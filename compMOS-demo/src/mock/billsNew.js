/**
 * 账单包Mock数据（重构版）
 */

import {
  BILL_STATUS,
  BUSINESS_TYPE,
  INVOICE_TYPE,
  LEGAL_ENTITY_OPTIONS,
  PAYMENT_ACCOUNT_OPTIONS,
  DEPARTMENT_OPTIONS
} from "@/utils/constants";

/**
 * 生成账单包数据
 */
export const billPackages = [
  {
    billNo: "BILL202601001",
    settlementCycle: "2026-01",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    billStatus: BILL_STATUS.PENDING_CONFIRM,
    totalAmount: 125680.50,
    pendingInvoiceAmount: 125680.50,
    invoicedAmount: 0,
    paidAmount: 0,
    createTime: "2026-02-01 10:00:00",
    updateTime: "2026-02-01 10:00:00",
    companyId: "C001",
    companyName: "示例科技有限公司"
  },
  {
    billNo: "BILL202512001",
    settlementCycle: "2025-12",
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    billStatus: BILL_STATUS.PENDING_INVOICE,
    totalAmount: 98450.00,
    pendingInvoiceAmount: 98450.00,
    invoicedAmount: 0,
    paidAmount: 0,
    confirmedTime: "2026-01-05 14:30:00",
    createTime: "2026-01-01 09:00:00",
    updateTime: "2026-01-05 14:30:00",
    companyId: "C001",
    companyName: "示例科技有限公司"
  },
  {
    billNo: "BILL202511001",
    settlementCycle: "2025-11",
    startDate: "2025-11-01",
    endDate: "2025-11-30",
    billStatus: BILL_STATUS.PENDING_PAYMENT,
    totalAmount: 156890.80,
    pendingInvoiceAmount: 0,
    invoicedAmount: 156890.80,
    paidAmount: 0,
    confirmedTime: "2025-12-03 11:20:00",
    invoicedTime: "2025-12-05 16:45:00",
    createTime: "2025-12-01 08:00:00",
    updateTime: "2025-12-05 16:45:00",
    companyId: "C001",
    companyName: "示例科技有限公司"
  },
  {
    billNo: "BILL202510001",
    settlementCycle: "2025-10",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    billStatus: BILL_STATUS.SETTLED,
    totalAmount: 203450.60,
    pendingInvoiceAmount: 0,
    invoicedAmount: 203450.60,
    paidAmount: 203450.60,
    confirmedTime: "2025-11-02 10:15:00",
    invoicedTime: "2025-11-04 15:30:00",
    settledTime: "2025-11-10 09:20:00",
    createTime: "2025-11-01 08:00:00",
    updateTime: "2025-11-10 09:20:00",
    companyId: "C001",
    companyName: "示例科技有限公司"
  }
];

/**
 * 生成账单汇总数据
 * @param {String} billNo - 账单号
 */
export function generateBillSummary(billNo) {
  const bill = billPackages.find(b => b.billNo === billNo);
  if (!bill) return null;

  // 获取实际订单数据来计算统计
  const getOrderStats = () => {
    // 尝试从全局订单数据中获取
    if (typeof window !== 'undefined' && window.__ordersCache) {
      const orders = window.__ordersCache.get(billNo) || [];
      return calculateStatsFromOrders(orders);
    }
    
    // 默认使用静态数据
    return {
      totalCount: 45,
      businessLineSummary: [
        {
          businessType: BUSINESS_TYPE.FLIGHT,
          businessTypeName: "机票",
          totalAmount: 68500.00,
          count: 25,
          checkedCount: bill.billStatus >= BILL_STATUS.PENDING_INVOICE ? 25 : 0
        },
        {
          businessType: BUSINESS_TYPE.HOTEL,
          businessTypeName: "酒店",
          totalAmount: 42180.50,
          count: 15,
          checkedCount: bill.billStatus >= BILL_STATUS.PENDING_INVOICE ? 15 : 0
        },
        {
          businessType: BUSINESS_TYPE.TRAIN,
          businessTypeName: "火车票",
          totalAmount: 15000.00,
          count: 5,
          checkedCount: bill.billStatus >= BILL_STATUS.PENDING_INVOICE ? 5 : 0
        }
      ]
    };
  };
  
  const stats = getOrderStats();

  return {
    billNo: bill.billNo,
    settlementCycle: bill.settlementCycle,
    totalAmount: bill.totalAmount,
    totalCount: stats.totalCount,
    businessLineSummary: stats.businessLineSummary
  };
}

/**
 * 从订单数据计算统计信息
 */
function calculateStatsFromOrders(orders) {
  const stats = {
    totalCount: orders.length,
    businessLineSummary: []
  };
  
  // 按业务类型分组统计
  const typeMap = new Map();
  
  orders.forEach(order => {
    const type = order.businessType;
    if (!typeMap.has(type)) {
      typeMap.set(type, {
        businessType: type,
        businessTypeName: order.businessTypeName || '',
        totalAmount: 0,
        count: 0,
        checkedCount: 0
      });
    }
    
    const typeStats = typeMap.get(type);
    typeStats.totalAmount += order.amount || 0;
    typeStats.count += 1;
    if (order.checkStatus === 1) {
      typeStats.checkedCount += 1;
    }
  });
  
  stats.businessLineSummary = Array.from(typeMap.values());
  
  return stats;
}

/**
 * 生成明细拆分数据
 * @param {String} billNo - 账单号
 * @param {Array} dimensions - 拆分维度
 */
export function generateDetailSplit(billNo, dimensions = ["businessLine"]) {
  if (dimensions.length === 0) {
    return {
      totalAmount: 125680.50,
      details: []
    };
  }

  // 模拟一级维度拆分
  if (dimensions[0] === "businessLine") {
    return {
      totalAmount: 125680.50,
      details: [
        {
          dimension: "businessLine",
          dimensionValue: BUSINESS_TYPE.FLIGHT,
          dimensionLabel: "机票",
          amount: 68500.00,
          count: 25,
          children: dimensions.length > 1 ? generateSecondLevelSplit(dimensions[1]) : []
        },
        {
          dimension: "businessLine",
          dimensionValue: BUSINESS_TYPE.HOTEL,
          dimensionLabel: "酒店",
          amount: 42180.50,
          count: 15,
          children: dimensions.length > 1 ? generateSecondLevelSplit(dimensions[1]) : []
        },
        {
          dimension: "businessLine",
          dimensionValue: BUSINESS_TYPE.TRAIN,
          dimensionLabel: "火车票",
          amount: 15000.00,
          count: 5,
          children: dimensions.length > 1 ? generateSecondLevelSplit(dimensions[1]) : []
        }
      ]
    };
  }

  // 其他维度拆分
  return {
    totalAmount: 125680.50,
    details: []
  };
}

/**
 * 生成二级拆分数据
 */
function generateSecondLevelSplit(dimension) {
  if (dimension === "legalEntity") {
    return [
      {
        dimension: "legalEntity",
        dimensionValue: LEGAL_ENTITY_OPTIONS[0],
        dimensionLabel: LEGAL_ENTITY_OPTIONS[0],
        amount: 50000.00,
        count: 10
      },
      {
        dimension: "legalEntity",
        dimensionValue: LEGAL_ENTITY_OPTIONS[1],
        dimensionLabel: LEGAL_ENTITY_OPTIONS[1],
        amount: 18500.00,
        count: 15
      }
    ];
  }
  
  if (dimension === "paymentAccount") {
    return [
      {
        dimension: "paymentAccount",
        dimensionValue: PAYMENT_ACCOUNT_OPTIONS[0],
        dimensionLabel: PAYMENT_ACCOUNT_OPTIONS[0],
        amount: 40000.00,
        count: 12
      },
      {
        dimension: "paymentAccount",
        dimensionValue: PAYMENT_ACCOUNT_OPTIONS[1],
        dimensionLabel: PAYMENT_ACCOUNT_OPTIONS[1],
        amount: 28500.00,
        count: 13
      }
    ];
  }
  
  return [];
}

/**
 * 生成字段配置
 */
export function generateFieldConfig() {
  return {
    display: [
      "orderNo",
      "businessType",
      "travelerName",
      "departDate",
      "route",
      "amount",
      "legalEntity",
      "department",
      "checkStatus"
    ],
    excelExport: [
      "orderNo",
      "businessType",
      "travelerName",
      "departDate",
      "route",
      "amount",
      "legalEntity",
      "department",
      "paymentAccount",
      "costCenter",
      "checkStatus"
    ],
    pdfExport: [
      "orderNo",
      "businessType",
      "travelerName",
      "departDate",
      "route",
      "amount",
      "legalEntity",
      "department"
    ]
  };
}

/**
 * 生成可用字段选项
 */
export function generateAvailableFields() {
  return [
    { value: "orderNo", label: "订单号" },
    { value: "businessType", label: "业务类型" },
    { value: "travelerName", label: "出行人" },
    { value: "departDate", label: "出发日期" },
    { value: "route", label: "行程" },
    { value: "amount", label: "金额" },
    { value: "legalEntity", label: "法人实体" },
    { value: "department", label: "部门" },
    { value: "paymentAccount", label: "支付账户" },
    { value: "costCenter", label: "成本中心" },
    { value: "checkStatus", label: "核对状态" },
    { value: "bookingPerson", label: "预订人" },
    { value: "bookingTime", label: "预订时间" },
    { value: "invoiceTitle", label: "发票抬头" }
  ];
}

export default {
  billPackages,
  generateBillSummary,
  generateDetailSplit,
  generateFieldConfig,
  generateAvailableFields
};

