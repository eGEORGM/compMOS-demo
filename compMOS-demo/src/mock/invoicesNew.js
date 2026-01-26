/**
 * 发票Mock数据（重构版）
 */

import Mock from "mockjs";
import {
  INVOICE_TYPE,
  INVOICE_STATUS,
  INVOICE_APPLICATION_STATUS,
  SPLIT_DIMENSION
} from "@/utils/constants";

/**
 * 生成发票汇总数据
 * @param {String} billNo - 账单号
 * @param {Number} totalAmount - 账单总金额
 */
export function generateInvoiceSummary(billNo, totalAmount, billStatus = 2) {
  // 如果账单已经进入开票状态，显示一些已完成的开票金额（模拟）
  // 否则显示0
  const invoicedAmount = billStatus >= 3 ? 125680.50 : 0; // 假设已开票金额
  const remainingAmount = totalAmount - invoicedAmount;
  
  // 构造发票明细
  const invoiceDetails = [
    {
      type: "增值税普票",
      summary: "酒店住宿",
      shouldAmount: 42180.50,
      invoicedAmount: billStatus >= 3 ? 42180.50 : 0,
      remainingAmount: billStatus >= 3 ? 0 : 42180.50,
      orderCount: 18
    },
    {
      type: "机票电子行程单",
      summary: "国内机票",
      shouldAmount: 68500.00,
      invoicedAmount: billStatus >= 3 ? 68500.00 : 0,
      remainingAmount: billStatus >= 3 ? 0 : 68500.00,
      orderCount: 25
    },
    {
      type: "火车票电子行程单",
      summary: "国内火车票",
      shouldAmount: 15000.00,
      invoicedAmount: billStatus >= 3 ? 15000.00 : 0,
      remainingAmount: billStatus >= 3 ? 0 : 15000.00,
      orderCount: 5
    }
  ];
  
  return {
    billNo,
    shouldInvoiceAmount: totalAmount,
    invoicedAmount,
    remainingAmount,
    invoiceDetails
  };
}

/**
 * 生成开票信息表
 * @param {String} billNo - 账单号
 * @param {Array|Object} splitConfig - 拆分维度配置
 */
export function generateInvoiceTable(billNo, splitConfig = []) {
  // 处理拆分配置
  let splitDimensions = [];
  if (Array.isArray(splitConfig)) {
    splitDimensions = splitConfig;
  } else if (splitConfig && splitConfig.dimensions) {
    splitDimensions = splitConfig.dimensions;
  } else if (splitConfig && splitConfig.dimension1) {
    splitDimensions = [splitConfig.dimension1];
    if (splitConfig.dimension2) {
      splitDimensions.push(splitConfig.dimension2);
    }
  }

  // 如果没有拆分维度，则按发票类型汇总
  if (splitDimensions.length === 0) {
    return [
      {
        invoiceType: INVOICE_TYPE.GENERAL,
        invoiceTypeName: "增值税普票",
        invoiceSummary: "全部订单",
        amount: 42180.50,
        invoiceTitle: {
          titleId: "T001",
          titleName: "示例科技有限公司",
          taxNumber: "91110108MA01234567"
        },
        recipient: {
          name: "张三",
          phone: "13800138000",
          address: "北京市海淀区中关村大街1号"
        },
        quantity: 1
      },
      {
        invoiceType: INVOICE_TYPE.FLIGHT_ITINERARY,
        invoiceTypeName: "机票电子行程单",
        invoiceSummary: "全部订单",
        amount: 68500.00,
        invoiceTitle: {
          titleId: "T001",
          titleName: "示例科技有限公司",
          taxNumber: "91110108MA01234567"
        },
        recipient: {
          name: "张三",
          phone: "13800138000",
          address: "北京市海淀区中关村大街1号"
        },
        quantity: 25
      },
      {
        invoiceType: INVOICE_TYPE.TRAIN_ITINERARY,
        invoiceTypeName: "火车票电子行程单",
        invoiceSummary: "全部订单",
        amount: 15000.00,
        invoiceTitle: {
          titleId: "T001",
          titleName: "示例科技有限公司",
          taxNumber: "91110108MA01234567"
        },
        recipient: {
          name: "张三",
          phone: "13800138000",
          address: "北京市海淀区中关村大街1号"
        },
        quantity: 5
      }
    ];
  }

  // 按拆分维度生成开票信息表
  return generateSplitInvoiceTable(billNo, splitDimensions);
}

/**
 * 生成拆分后的开票信息表
 */
function generateSplitInvoiceTable(billNo, dimensions) {
  const result = [];

  // 根据不同维度生成拆分后的开票行
  if (dimensions.includes(SPLIT_DIMENSION.BUSINESS_LINE)) {
    // 按业务线拆分
    result.push(
      {
        invoiceType: INVOICE_TYPE.FLIGHT_ITINERARY,
        invoiceTypeName: "机票电子行程单",
        invoiceSummary: "机票业务",
        amount: 68500.00,
        invoiceTitle: {
          titleId: "T001",
          titleName: "示例科技有限公司",
          taxNumber: "91110108MA01234567"
        },
        recipient: {
          name: "张三",
          phone: "13800138000",
          address: "北京市海淀区中关村大街1号"
        },
        quantity: 25,
        orderCount: 25,
        unit: "元",
        isValid: false,
        splitDimension1: "机票业务"
      },
      {
        invoiceType: INVOICE_TYPE.GENERAL,
        invoiceTypeName: "增值税普票",
        invoiceSummary: "酒店业务",
        amount: 42180.50,
        invoiceTitle: {
          titleId: "T001",
          titleName: "示例科技有限公司",
          taxNumber: "91110108MA01234567"
        },
        recipient: {
          name: "张三",
          phone: "13800138000",
          address: "北京市海淀区中关村大街1号"
        },
        quantity: 1,
        orderCount: 18,
        unit: "元",
        isValid: false,
        splitDimension1: "酒店业务"
      },
      {
        invoiceType: INVOICE_TYPE.TRAIN_ITINERARY,
        invoiceTypeName: "火车票电子行程单",
        invoiceSummary: "火车票业务",
        amount: 15000.00,
        invoiceTitle: {
          titleId: "T001",
          titleName: "示例科技有限公司",
          taxNumber: "91110108MA01234567"
        },
        recipient: {
          name: "张三",
          phone: "13800138000",
          address: "北京市海淀区中关村大街1号"
        },
        quantity: 5,
        orderCount: 5,
        unit: "元",
        isValid: false,
        splitDimension1: "火车票业务"
      }
    );
  } else if (dimensions.includes(SPLIT_DIMENSION.LEGAL_ENTITY)) {
    // 按法人实体拆分
    result.push(
      {
        invoiceType: INVOICE_TYPE.FLIGHT_ITINERARY,
        invoiceTypeName: "机票电子行程单",
        invoiceSummary: "北京分公司",
        amount: 54250.00,
        invoiceTitle: {
          titleId: "T001",
          titleName: "示例科技有限公司",
          taxNumber: "91110108MA01234567"
        },
        recipient: {
          name: "张三",
          phone: "13800138000",
          address: "北京市海淀区中关村大街1号"
        },
        quantity: 20,
        orderCount: 20,
        unit: "元",
        isValid: false,
        splitDimension1: "北京分公司"
      },
      {
        invoiceType: INVOICE_TYPE.FLIGHT_ITINERARY,
        invoiceTypeName: "机票电子行程单",
        invoiceSummary: "上海分公司",
        amount: 14250.00,
        invoiceTitle: {
          titleId: "T002",
          titleName: "示例贸易有限公司",
          taxNumber: "91310115MA1234567X"
        },
        recipient: {
          name: "李四",
          phone: "13800138001",
          address: "上海市浦东新区陆家嘴环路1000号"
        },
        quantity: 5,
        orderCount: 5,
        unit: "元",
        isValid: false,
        splitDimension1: "上海分公司"
      }
    );
  } else if (dimensions.includes(SPLIT_DIMENSION.DEPARTMENT)) {
    // 按部门拆分
    result.push(
      {
        invoiceType: INVOICE_TYPE.FLIGHT_ITINERARY,
        invoiceTypeName: "机票电子行程单",
        invoiceSummary: "销售部",
        amount: 34250.00,
        invoiceTitle: {
          titleId: "T001",
          titleName: "示例科技有限公司",
          taxNumber: "91110108MA01234567"
        },
        recipient: {
          name: "张三",
          phone: "13800138000",
          address: "北京市海淀区中关村大街1号"
        },
        quantity: 12,
        orderCount: 12,
        unit: "元",
        isValid: false,
        splitDimension1: "销售部"
      },
      {
        invoiceType: INVOICE_TYPE.FLIGHT_ITINERARY,
        invoiceTypeName: "机票电子行程单",
        invoiceSummary: "技术部",
        amount: 34250.00,
        invoiceTitle: {
          titleId: "T001",
          titleName: "示例科技有限公司",
          taxNumber: "91110108MA01234567"
        },
        recipient: {
          name: "王五",
          phone: "13800138002",
          address: "北京市海淀区中关村大街1号"
        },
        quantity: 13,
        orderCount: 13,
        unit: "元",
        isValid: false,
        splitDimension1: "技术部"
      }
    );
  }

  return result;
}

/**
 * 生成开票申请记录
 * @param {String} billNo - 账单号
 */
export function generateInvoiceApplications(billNo) {
  const now = new Date();
  const applications = [];

  // 增值税普票申请
  applications.push({
    applicationNo: `APP${Mock.Random.date("yyyyMMdd")}001`,
    billNo,
    invoiceType: "增值税普票",
    content: "酒店住宿服务费",
    amount: 42180.50,
    titleName: "示例科技有限公司",
    taxNumber: "91110108MA01234567",
    submitter: "张三",
    applyTime: new Date(now.getTime() - 86400000 * 5).toISOString().slice(0, 19).replace('T', ' '),
    status: "completed",
    isFlushed: false,
    remark: ""
  });

  // 机票行程单申请（批次1）
  applications.push({
    applicationNo: `APP${Mock.Random.date("yyyyMMdd")}002`,
    billNo,
    invoiceType: "机票电子行程单",
    content: "国内机票行程单（25张）",
    amount: 68500.00,
    titleName: "示例科技有限公司",
    taxNumber: "91110108MA01234567",
    submitter: "李四",
    applyTime: new Date(now.getTime() - 86400000 * 4).toISOString().slice(0, 19).replace('T', ' '),
    status: "completed",
    isFlushed: false,
    remark: ""
  });

  // 火车票行程单申请
  applications.push({
    applicationNo: `APP${Mock.Random.date("yyyyMMdd")}003`,
    billNo,
    invoiceType: "火车票电子行程单",
    content: "国内火车票行程单（5张）",
    amount: 15000.00,
    titleName: "示例科技有限公司",
    taxNumber: "91110108MA01234567",
    submitter: "王五",
    applyTime: new Date(now.getTime() - 86400000 * 3).toISOString().slice(0, 19).replace('T', ' '),
    status: "completed",
    isFlushed: false,
    remark: ""
  });

  // 已红冲的发票记录
  applications.push({
    applicationNo: `APP${Mock.Random.date("yyyyMMdd")}004`,
    billNo,
    invoiceType: "增值税专票",
    content: "会务服务费",
    amount: 8500.00,
    titleName: "示例贸易有限公司",
    taxNumber: "91310115MA1234567X",
    submitter: "赵六",
    applyTime: new Date(now.getTime() - 86400000 * 10).toISOString().slice(0, 19).replace('T', ' '),
    status: "completed",
    isFlushed: true,
    flushedTime: new Date(now.getTime() - 86400000 * 2).toISOString().slice(0, 19).replace('T', ' '),
    flushedReason: "发票抬头有误",
    remark: "已红冲，待换开"
  });

  // 处理中的申请
  applications.push({
    applicationNo: `APP${Mock.Random.date("yyyyMMdd")}005`,
    billNo,
    invoiceType: "增值税普票",
    content: "差旅服务费",
    amount: 12300.00,
    titleName: "示例科技有限公司",
    taxNumber: "91110108MA01234567",
    submitter: "孙七",
    applyTime: new Date(now.getTime() - 3600000).toISOString().slice(0, 19).replace('T', ' '),
    status: "processing",
    isFlushed: false,
    remark: "开票中"
  });

  return applications;
}

/**
 * 生成发票列表
 * @param {String} billNo - 账单号
 */
export function generateInvoiceList(billNo) {
  const invoices = [];

  // 机票行程单
  for (let i = 0; i < 25; i++) {
    invoices.push({
      invoiceId: `INV${Mock.Random.date("yyyyMMdd")}${String(i).padStart(5, "0")}`,
      billNo,
      invoiceType: INVOICE_TYPE.FLIGHT_ITINERARY,
      invoiceTypeName: "机票电子行程单",
      invoiceNo: `FLIGHT${Mock.Random.integer(100000000, 999999999)}`,
      amount: Mock.Random.float(800, 3000, 2, 2),
      invoiceTitle: "示例科技有限公司",
      taxNumber: "91110108MA01234567",
      invoiceDate: "2026-01-15",
      status: INVOICE_STATUS.ISSUED,
      downloadUrl: "/mock/download/invoice/" + i,
      canRedFlush: true,
      canReissue: false
    });
  }

  // 增值税普票（酒店）
  invoices.push({
    invoiceId: `INV${Mock.Random.date("yyyyMMdd")}10000`,
    billNo,
    invoiceType: INVOICE_TYPE.GENERAL,
    invoiceTypeName: "增值税普票",
    invoiceNo: `VAT${Mock.Random.integer(10000000, 99999999)}`,
    amount: 42180.50,
    invoiceTitle: "示例科技有限公司",
    taxNumber: "91110108MA01234567",
    invoiceDate: "2026-01-15",
    status: INVOICE_STATUS.ISSUED,
    downloadUrl: "/mock/download/invoice/hotel",
    canRedFlush: true,
    canReissue: true
  });

  // 火车票行程单
  for (let i = 0; i < 5; i++) {
    invoices.push({
      invoiceId: `INV${Mock.Random.date("yyyyMMdd")}${String(i + 20000).padStart(5, "0")}`,
      billNo,
      invoiceType: INVOICE_TYPE.TRAIN_ITINERARY,
      invoiceTypeName: "火车票电子行程单",
      invoiceNo: `TRAIN${Mock.Random.integer(100000000, 999999999)}`,
      amount: Mock.Random.float(200, 800, 2, 2),
      invoiceTitle: "示例科技有限公司",
      taxNumber: "91110108MA01234567",
      invoiceDate: "2026-01-15",
      status: INVOICE_STATUS.ISSUED,
      downloadUrl: "/mock/download/invoice/train" + i,
      canRedFlush: true,
      canReissue: false
    });
  }

  return invoices;
}

/**
 * 生成发票抬头列表
 */
export function generateInvoiceTitles() {
  return [
    {
      titleId: "T001",
      titleName: "示例科技有限公司",
      taxNumber: "91110108MA01234567",
      address: "北京市海淀区中关村大街1号",
      phone: "010-12345678",
      bankName: "中国工商银行北京中关村支行",
      bankAccount: "0200001234567890123",
      isDefault: true,
      createTime: "2025-01-01 10:00:00"
    },
    {
      titleId: "T002",
      titleName: "示例贸易有限公司",
      taxNumber: "91310115MA1234567X",
      address: "上海市浦东新区陆家嘴环路1000号",
      phone: "021-87654321",
      bankName: "中国建设银行上海浦东支行",
      bankAccount: "31001234567890123456",
      isDefault: false,
      createTime: "2025-02-01 14:30:00"
    }
  ];
}

export default {
  generateInvoiceSummary,
  generateInvoiceTable,
  generateInvoiceApplications,
  generateInvoiceList,
  generateInvoiceTitles
};

