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
  
  // 构造发票明细（根据图片示例）
  const invoiceDetails = [
    {
      type: "增值税普通发票",
      summary: "机票住宿费",
      shouldAmount: 9783.47,
      invoicedAmount: billStatus >= 3 ? 9783.47 : 0,
      remainingAmount: billStatus >= 3 ? 0 : 9783.47,
      orderCount: 18
    },
    {
      type: "增值税普通发票",
      summary: "代理服务费",
      shouldAmount: 100.00,
      invoicedAmount: billStatus >= 3 ? 100.00 : 0,
      remainingAmount: billStatus >= 3 ? 0 : 100.00,
      orderCount: 2
    },
    {
      type: "增值税普通发票",
      summary: "保险费",
      shouldAmount: 0.00,
      invoicedAmount: 0.00,
      remainingAmount: 0.00,
      orderCount: 0
    }
  ];
  
  // 计算总金额
  const calculatedTotal = invoiceDetails.reduce((sum, item) => sum + item.shouldAmount, 0);
  
  return {
    billNo,
    shouldInvoiceAmount: calculatedTotal || totalAmount,
    invoicedAmount: billStatus >= 3 ? calculatedTotal : 0,
    remainingAmount: billStatus >= 3 ? 0 : (calculatedTotal || totalAmount),
    invoiceDetails
  };
}

/**
 * 生成开票信息表
 * @param {String} billNo - 账单号
 * @param {Array} splitDimensions - 拆分维度
 * @param {Array} orders - 订单数据
 */
export function generateInvoiceTable(billNo, splitDimensions = [], orders = []) {
  const { INVOICE_TYPE_NAMES } = require("@/utils/constants");
  
  console.log("generateInvoiceTable - splitDimensions:", splitDimensions);
  console.log("generateInvoiceTable - orders:", orders.length);
  
  // 如果没有拆分维度，则按发票类型汇总
  if (splitDimensions.length === 0) {
    return [
      {
        invoiceType: INVOICE_TYPE_NAMES[INVOICE_TYPE.GENERAL] || "增值税普通发票",
        invoiceTypeName: INVOICE_TYPE_NAMES[INVOICE_TYPE.GENERAL] || "增值税普通发票",
        summary: "全部订单",
        invoiceSummary: "全部订单",
        amount: 42180.48,
        orderCount: 20,
        quantity: 1,
        unit: "元",
        // 拆分维度字段（即使没有拆分，也保留字段以便表格显示）
        businessLine: "",
        legalEntity: "",
        splitDimension1: "",
        splitDimension2: "",
        // 抬头信息（扁平化）
        titleId: "",
        titleName: "",
        taxNumber: "",
        // 接收人信息（扁平化）
        receiverId: "",
        receiverName: "",
        receiverPhone: "",
        receiverEmail: "",
        receiverAddress: "",
        isValid: false
      },
      {
        invoiceType: INVOICE_TYPE_NAMES[INVOICE_TYPE.SPECIAL] || "增值税专用发票",
        invoiceTypeName: INVOICE_TYPE_NAMES[INVOICE_TYPE.SPECIAL] || "增值税专用发票",
        summary: "全部订单",
        invoiceSummary: "全部订单",
        amount: 35000.04,
        orderCount: 15,
        quantity: 1,
        unit: "元",
        // 拆分维度字段
        businessLine: "",
        legalEntity: "",
        splitDimension1: "",
        splitDimension2: "",
        // 抬头信息（扁平化）
        titleId: "",
        titleName: "",
        taxNumber: "",
        // 接收人信息（扁平化）
        receiverId: "",
        receiverName: "",
        receiverPhone: "",
        receiverEmail: "",
        receiverAddress: "",
        isValid: false
      },
      {
        invoiceType: INVOICE_TYPE_NAMES[INVOICE_TYPE.FLIGHT_ITINERARY] || "机票电子行程单",
        invoiceTypeName: INVOICE_TYPE_NAMES[INVOICE_TYPE.FLIGHT_ITINERARY] || "机票电子行程单",
        summary: "全部订单",
        invoiceSummary: "全部订单",
        amount: 68499.96,
        orderCount: 25,
        quantity: 25,
        unit: "元",
        // 拆分维度字段
        businessLine: "",
        legalEntity: "",
        splitDimension1: "",
        splitDimension2: "",
        // 抬头信息（扁平化）
        titleId: "",
        titleName: "",
        taxNumber: "",
        // 接收人信息（扁平化）
        receiverId: "",
        receiverName: "",
        receiverPhone: "",
        receiverEmail: "",
        receiverAddress: "",
        isValid: false
      },
      {
        invoiceType: INVOICE_TYPE_NAMES[INVOICE_TYPE.TRAIN_ITINERARY] || "火车票电子行程单",
        invoiceTypeName: INVOICE_TYPE_NAMES[INVOICE_TYPE.TRAIN_ITINERARY] || "火车票电子行程单",
        summary: "全部订单",
        invoiceSummary: "全部订单",
        amount: 15000.00,
        orderCount: 5,
        quantity: 5,
        unit: "元",
        // 拆分维度字段
        businessLine: "",
        legalEntity: "",
        splitDimension1: "",
        splitDimension2: "",
        // 抬头信息（扁平化）
        titleId: "",
        titleName: "",
        taxNumber: "",
        // 接收人信息（扁平化）
        receiverId: "",
        receiverName: "",
        receiverPhone: "",
        receiverEmail: "",
        receiverAddress: "",
        isValid: false
      }
    ];
  }

  // 按拆分维度生成开票信息表，传入订单数据
  return generateSplitInvoiceTable(billNo, splitDimensions, orders);
}

/**
 * 获取订单的维度值
 */
function getDimensionValue(order, dimension) {
  const { SPLIT_DIMENSION, BUSINESS_TYPE_NAMES } = require("@/utils/constants");
  
  switch (dimension) {
    case SPLIT_DIMENSION.BUSINESS_LINE:
      return BUSINESS_TYPE_NAMES[order.businessType] || order.businessLine || "其他";
    case SPLIT_DIMENSION.LEGAL_ENTITY:
      return order.legalEntity || "默认法人实体";
    case SPLIT_DIMENSION.PAYMENT_ACCOUNT:
      return order.paymentAccount || "默认支付账户";
    case SPLIT_DIMENSION.DEPARTMENT:
      return order.department || "默认部门";
    default:
      return "其他";
  }
}

/**
 * 生成拆分后的开票信息表
 * 根据订单业务类型决定发票种类，再按拆分字段分组
 */
function generateSplitInvoiceTable(billNo, dimensions, orders = []) {
  const { INVOICE_TYPE_NAMES, BUSINESS_TYPE, INVOICE_TYPE } = require("@/utils/constants");
  
  console.log("generateSplitInvoiceTable - orders count:", orders.length);
  
  // 根据订单的业务类型来分组并确定发票种类
  const ordersByBusinessType = {};
  orders.forEach(order => {
    const businessType = order.businessType || 'OTHER';
    if (!ordersByBusinessType[businessType]) {
      ordersByBusinessType[businessType] = [];
    }
    ordersByBusinessType[businessType].push(order);
  });
  
  console.log("generateSplitInvoiceTable - ordersByBusinessType:", Object.keys(ordersByBusinessType));
  console.log("generateSplitInvoiceTable - 订单示例:", orders.slice(0, 2));
  
  // 定义哪些业务类型可以开哪些发票
  // 机票只能开机票电子行程单，火车票只能开火车票电子行程单
  // 其他业务类型（酒店、用车等）可以开增值税普票或专票
  const getInvoiceTypesForBusinessType = (businessType, ordersOfType) => {
    const totalAmount = ordersOfType.reduce((sum, order) => sum + (order.payAmount || 0), 0);
    const orderCount = ordersOfType.length;
    
    switch (businessType) {
      case BUSINESS_TYPE.FLIGHT:
        // 机票只能开机票电子行程单
        return [{
          type: INVOICE_TYPE.FLIGHT_ITINERARY,
          name: INVOICE_TYPE_NAMES[INVOICE_TYPE.FLIGHT_ITINERARY] || "机票电子行程单",
          amount: totalAmount,
          quantity: orderCount,
          businessType: businessType,
          orders: ordersOfType
        }];
        
      case BUSINESS_TYPE.TRAIN:
        // 火车票只能开火车票电子行程单
        return [{
          type: INVOICE_TYPE.TRAIN_ITINERARY,
          name: INVOICE_TYPE_NAMES[INVOICE_TYPE.TRAIN_ITINERARY] || "火车票电子行程单",
          amount: totalAmount,
          quantity: orderCount,
          businessType: businessType,
          orders: ordersOfType
        }];
        
      default:
        // 其他业务类型（酒店、用车等）可以开增值税普票或专票
        // 这里按照一定比例分配，实际应用中可能需要用户选择
        const generalAmount = totalAmount * 0.6; // 60% 开普票
        const specialAmount = totalAmount * 0.4; // 40% 开专票
        
        return [
          {
            type: INVOICE_TYPE.GENERAL,
            name: INVOICE_TYPE_NAMES[INVOICE_TYPE.GENERAL] || "增值税普通发票",
            amount: parseFloat(generalAmount.toFixed(2)),
            quantity: 1,
            businessType: businessType,
            orders: ordersOfType.slice(0, Math.ceil(ordersOfType.length * 0.6))
          },
          {
            type: INVOICE_TYPE.SPECIAL,
            name: INVOICE_TYPE_NAMES[INVOICE_TYPE.SPECIAL] || "增值税专用发票",
            amount: parseFloat(specialAmount.toFixed(2)),
            quantity: 1,
            businessType: businessType,
            orders: ordersOfType.slice(Math.ceil(ordersOfType.length * 0.6))
          }
        ];
    }
  };
  
  // 如果没有订单数据，使用模拟数据
  let invoiceTypes = [];
  
  if (orders.length === 0) {
    invoiceTypes = [
      { type: INVOICE_TYPE.GENERAL, name: "增值税普通发票", amount: 42180.50, quantity: 1, businessType: 'OTHER', orders: [] },
      { type: INVOICE_TYPE.SPECIAL, name: "增值税专用发票", amount: 35000.00, quantity: 1, businessType: 'OTHER', orders: [] },
      { type: INVOICE_TYPE.FLIGHT_ITINERARY, name: "机票电子行程单", amount: 68500.00, quantity: 25, businessType: BUSINESS_TYPE.FLIGHT, orders: [] },
      { type: INVOICE_TYPE.TRAIN_ITINERARY, name: "火车票电子行程单", amount: 15000.00, quantity: 5, businessType: BUSINESS_TYPE.TRAIN, orders: [] }
    ];
  } else {
    // 根据业务类型生成发票类型
    Object.keys(ordersByBusinessType).forEach(businessType => {
      const ordersOfType = ordersByBusinessType[businessType];
      const invoiceTypesForBusiness = getInvoiceTypesForBusinessType(businessType, ordersOfType);
      invoiceTypes = invoiceTypes.concat(invoiceTypesForBusiness);
    });
  }
  
  console.log("generateSplitInvoiceTable - invoiceTypes:", invoiceTypes);
  
  const result = [];
  
  // 为每个发票种类生成数据
  invoiceTypes.forEach((invoiceType, typeIndex) => {
    const ordersForType = invoiceType.orders || [];
    
    if (dimensions.length === 0) {
      // 没有拆分字段，直接生成该发票种类的数据
      result.push({
        invoiceType: invoiceType.name,
        invoiceTypeName: invoiceType.name,
        summary: "全部订单",
        invoiceSummary: "全部订单",
        amount: invoiceType.amount,
        orderCount: ordersForType.length || Math.floor(invoiceType.quantity * 2) || 10,
        quantity: invoiceType.quantity,
        unit: "元",
        // 拆分维度字段（即使没有拆分，也保留字段以便表格显示）
        businessLine: "",
        legalEntity: "",
        splitDimension1: "",
        splitDimension2: "",
        // 抬头信息（扁平化）
        titleId: "",
        titleName: "",
        taxNumber: "",
        // 接收人信息（扁平化）
        receiverId: "",
        receiverName: "",
        receiverPhone: "",
        receiverEmail: "",
        receiverAddress: "",
        isValid: false
      });
    } else {
      // 有拆分字段，根据订单数据进行拆分
      const firstDimension = dimensions[0];
      
      // 如果有订单数据，根据订单的维度值进行分组
      if (ordersForType.length > 0) {
        const ordersByDimension = {};
        ordersForType.forEach(order => {
          const dimensionValue = getDimensionValue(order, firstDimension);
          if (!ordersByDimension[dimensionValue]) {
            ordersByDimension[dimensionValue] = [];
          }
          ordersByDimension[dimensionValue].push(order);
        });
        
        const firstValues = Object.keys(ordersByDimension);
        
        firstValues.forEach((firstValue, firstIndex) => {
          const ordersForDimension = ordersByDimension[firstValue];
          const splitAmount = ordersForDimension.reduce((sum, order) => sum + (order.payAmount || 0), 0);
          const splitOrderCount = ordersForDimension.length;
          const splitQuantity = (invoiceType.businessType === BUSINESS_TYPE.FLIGHT || invoiceType.businessType === BUSINESS_TYPE.TRAIN) 
            ? splitOrderCount : 1;
          
          console.log("generateSplitInvoiceTable - 拆分计算:", {
            firstValue,
            ordersCount: ordersForDimension.length,
            splitAmount,
            orders: ordersForDimension.map(o => ({ orderNo: o.orderNo, payAmount: o.payAmount }))
          });
          
          if (dimensions.length === 1) {
            // 只有一个拆分字段
            const row = {
              invoiceType: invoiceType.name,
              invoiceTypeName: invoiceType.name,
              summary: firstValue,
              invoiceSummary: firstValue,
              amount: parseFloat(splitAmount.toFixed(2)),
              orderCount: splitOrderCount,
              quantity: splitQuantity,
              unit: "元",
              // 拆分维度字段
              businessLine: firstDimension === SPLIT_DIMENSION.BUSINESS_LINE ? firstValue : "",
              legalEntity: firstDimension === SPLIT_DIMENSION.LEGAL_ENTITY ? firstValue : "",
              paymentAccount: firstDimension === SPLIT_DIMENSION.PAYMENT_ACCOUNT ? firstValue : "",
              department: firstDimension === SPLIT_DIMENSION.DEPARTMENT ? firstValue : "",
              splitDimension1: firstValue,
              splitDimension2: "",
              // 抬头信息（扁平化，初始为空，用户需要填写）
              titleId: "",
              titleName: "",
              taxNumber: "",
              // 接收人信息（扁平化，初始为空，用户需要填写）
              receiverId: "",
              receiverName: "",
              receiverPhone: "",
              receiverEmail: "",
              receiverAddress: "",
              isValid: false
            };
            
            console.log("generateSplitInvoiceTable - 单维度行:", row);
            result.push(row);
          } else {
            // 有两个拆分字段，继续按第二维度拆分
            const secondDimension = dimensions[1];
            const ordersBySecondDimension = {};
            
            ordersForDimension.forEach(order => {
              const secondValue = getDimensionValue(order, secondDimension);
              if (!ordersBySecondDimension[secondValue]) {
                ordersBySecondDimension[secondValue] = [];
              }
              ordersBySecondDimension[secondValue].push(order);
            });
            
            Object.keys(ordersBySecondDimension).forEach((secondValue) => {
              const ordersForSecondDimension = ordersBySecondDimension[secondValue];
              const splitAmount = ordersForSecondDimension.reduce((sum, order) => sum + (order.payAmount || 0), 0);
              const splitOrderCount = ordersForSecondDimension.length;
              const splitQuantity = (invoiceType.businessType === BUSINESS_TYPE.FLIGHT || invoiceType.businessType === BUSINESS_TYPE.TRAIN) 
                ? splitOrderCount : 1;
              
              result.push({
                invoiceType: invoiceType.name,
                invoiceTypeName: invoiceType.name,
                summary: `${firstValue} - ${secondValue}`,
                invoiceSummary: `${firstValue} - ${secondValue}`,
                amount: parseFloat(splitAmount.toFixed(2)),
                orderCount: splitOrderCount,
                quantity: splitQuantity,
                unit: "元",
                // 拆分维度字段
                businessLine: firstDimension === SPLIT_DIMENSION.BUSINESS_LINE ? firstValue : 
                             (secondDimension === SPLIT_DIMENSION.BUSINESS_LINE ? secondValue : ""),
                legalEntity: firstDimension === SPLIT_DIMENSION.LEGAL_ENTITY ? firstValue : 
                            (secondDimension === SPLIT_DIMENSION.LEGAL_ENTITY ? secondValue : ""),
                paymentAccount: firstDimension === SPLIT_DIMENSION.PAYMENT_ACCOUNT ? firstValue : 
                              (secondDimension === SPLIT_DIMENSION.PAYMENT_ACCOUNT ? secondValue : ""),
                department: firstDimension === SPLIT_DIMENSION.DEPARTMENT ? firstValue : 
                           (secondDimension === SPLIT_DIMENSION.DEPARTMENT ? secondValue : ""),
                splitDimension1: firstValue,
                splitDimension2: secondValue,
                // 抬头信息（扁平化，初始为空，用户需要填写）
                titleId: "",
                titleName: "",
                taxNumber: "",
                // 接收人信息（扁平化，初始为空，用户需要填写）
                receiverId: "",
                receiverName: "",
                receiverPhone: "",
                receiverEmail: "",
                receiverAddress: "",
                isValid: false
              });
            });
          }
        });
      } else {
        // 没有订单数据，使用模拟数据
        const dimensionValues = {
          [SPLIT_DIMENSION.BUSINESS_LINE]: ["机票", "酒店", "火车票", "用车"],
          [SPLIT_DIMENSION.LEGAL_ENTITY]: ["北京分公司", "上海分公司", "深圳分公司"],
          [SPLIT_DIMENSION.PAYMENT_ACCOUNT]: ["账户A", "账户B", "账户C"],
          [SPLIT_DIMENSION.DEPARTMENT]: ["研发中心", "销售中心", "市场中心"]
        };
        
        const firstValues = dimensionValues[firstDimension] || ["其他"];
        
        firstValues.forEach((firstValue) => {
          if (dimensions.length === 1) {
            const splitAmount = invoiceType.amount / firstValues.length;
            const splitQuantity = Math.floor(invoiceType.quantity / firstValues.length) || 1;
            const splitOrderCount = Math.floor((Math.floor(invoiceType.quantity * 2) || 10) / firstValues.length) || 1;
            
            result.push({
              invoiceType: invoiceType.name,
              invoiceTypeName: invoiceType.name,
              summary: firstValue,
              invoiceSummary: firstValue,
              amount: parseFloat(splitAmount.toFixed(2)),
              orderCount: splitOrderCount,
              quantity: splitQuantity,
              unit: "元",
              businessLine: firstDimension === SPLIT_DIMENSION.BUSINESS_LINE ? firstValue : "",
              legalEntity: firstDimension === SPLIT_DIMENSION.LEGAL_ENTITY ? firstValue : "",
              paymentAccount: firstDimension === SPLIT_DIMENSION.PAYMENT_ACCOUNT ? firstValue : "",
              department: firstDimension === SPLIT_DIMENSION.DEPARTMENT ? firstValue : "",
              splitDimension1: firstValue,
              splitDimension2: "",
              titleId: "",
              titleName: "",
              taxNumber: "",
              receiverId: "",
              receiverName: "",
              receiverPhone: "",
              receiverEmail: "",
              receiverAddress: "",
              isValid: false
            });
          } else {
            const secondDimension = dimensions[1];
            const secondValues = dimensionValues[secondDimension] || ["其他"];
            
            secondValues.forEach((secondValue) => {
              const splitAmount = invoiceType.amount / (firstValues.length * secondValues.length);
              const splitQuantity = Math.floor(invoiceType.quantity / (firstValues.length * secondValues.length)) || 1;
              const splitOrderCount = Math.floor((Math.floor(invoiceType.quantity * 2) || 10) / (firstValues.length * secondValues.length)) || 1;
              
              result.push({
                invoiceType: invoiceType.name,
                invoiceTypeName: invoiceType.name,
                summary: `${firstValue} - ${secondValue}`,
                invoiceSummary: `${firstValue} - ${secondValue}`,
                amount: parseFloat(splitAmount.toFixed(2)),
                orderCount: splitOrderCount,
                quantity: splitQuantity,
                unit: "元",
                businessLine: firstDimension === SPLIT_DIMENSION.BUSINESS_LINE ? firstValue : 
                             (secondDimension === SPLIT_DIMENSION.BUSINESS_LINE ? secondValue : ""),
                legalEntity: firstDimension === SPLIT_DIMENSION.LEGAL_ENTITY ? firstValue : 
                            (secondDimension === SPLIT_DIMENSION.LEGAL_ENTITY ? secondValue : ""),
                paymentAccount: firstDimension === SPLIT_DIMENSION.PAYMENT_ACCOUNT ? firstValue : 
                              (secondDimension === SPLIT_DIMENSION.PAYMENT_ACCOUNT ? secondValue : ""),
                department: firstDimension === SPLIT_DIMENSION.DEPARTMENT ? firstValue : 
                           (secondDimension === SPLIT_DIMENSION.DEPARTMENT ? secondValue : ""),
                splitDimension1: firstValue,
                splitDimension2: secondValue,
                titleId: "",
                titleName: "",
                taxNumber: "",
                receiverId: "",
                receiverName: "",
                receiverPhone: "",
                receiverEmail: "",
                receiverAddress: "",
                isValid: false
              });
            });
          }
        });
      }
    }
  });
  
  return result;
}

/**
 * 生成开票申请记录
 * @param {String} billNo - 账单号
 */
export function generateInvoiceApplications(billNo) {
  const now = new Date();
  const applications = [];

  // 增值税普通发票申请（根据图片示例）
  applications.push({
    applicationNo: `APP${Mock.Random.date("yyyyMMdd")}001`,
    billNo,
    invoiceType: "增值税普通发票",
    content: "机票住宿费",
    amount: 9783.47,
    titleName: "杭州合思莫尔信息技术有限公司",
    taxNumber: "91310000MA1FL5G73X",
    submitter: "lizhimin@hosecloud.com",
    applyTime: "2025-07-28 14:07",
    status: "completed",
    isFlushed: false,
    remark: ""
  });

  applications.push({
    applicationNo: `APP${Mock.Random.date("yyyyMMdd")}002`,
    billNo,
    invoiceType: "增值税普通发票",
    content: "代理服务费",
    amount: 100.00,
    titleName: "厦门合思旅游有限公司",
    taxNumber: "91350200MA8XXXXXXX",
    submitter: "chengjie@hosecloud.com",
    applyTime: "2025-08-07 17:44",
    status: "completed",
    isFlushed: false,
    remark: ""
  });

  applications.push({
    applicationNo: `APP${Mock.Random.date("yyyyMMdd")}003`,
    billNo,
    invoiceType: "增值税普通发票",
    content: "机票住宿费",
    amount: -6002.47,
    titleName: "南京合思国际旅游有限公司",
    taxNumber: "91320100MA8XXXXXXX",
    submitter: "lizhimin@hosecloud.com",
    applyTime: "2025-08-10 10:30",
    status: "flushed",
    isFlushed: true,
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
    },
    {
      titleId: "T003",
      titleName: "北京分公司",
      taxNumber: "91110108MA01234568",
      address: "北京市朝阳区建国路88号",
      phone: "010-12345679",
      bankName: "中国银行北京朝阳支行",
      bankAccount: "10400012345678901234",
      isDefault: false,
      createTime: "2025-03-01 09:00:00"
    },
    {
      titleId: "T004",
      titleName: "上海分公司",
      taxNumber: "91310115MA1234568Y",
      address: "上海市黄浦区南京东路100号",
      phone: "021-87654322",
      bankName: "中国农业银行上海黄浦支行",
      bankAccount: "10329012345678901234",
      isDefault: false,
      createTime: "2025-03-15 11:30:00"
    },
    {
      titleId: "T005",
      titleName: "深圳分公司",
      taxNumber: "91440300MA1234567Z",
      address: "深圳市南山区科技园南区",
      phone: "0755-12345678",
      bankName: "招商银行深圳科技园支行",
      bankAccount: "75590012345678901234",
      isDefault: false,
      createTime: "2025-04-01 15:00:00"
    },
    {
      titleId: "T006",
      titleName: "广州分公司",
      taxNumber: "91440100MA1234568A",
      address: "广州市天河区天河路123号",
      phone: "020-12345678",
      bankName: "中国交通银行广州天河支行",
      bankAccount: "44000012345678901234",
      isDefault: false,
      createTime: "2025-04-15 16:00:00"
    },
    {
      titleId: "T007",
      titleName: "杭州分公司",
      taxNumber: "91330100MA1234569B",
      address: "杭州市西湖区文三路259号",
      phone: "0571-12345678",
      bankName: "中国民生银行杭州西湖支行",
      bankAccount: "33010012345678901234",
      isDefault: false,
      createTime: "2025-05-01 10:00:00"
    },
    {
      titleId: "T008",
      titleName: "成都分公司",
      taxNumber: "91510100MA1234570C",
      address: "成都市高新区天府大道中段1号",
      phone: "028-12345678",
      bankName: "中国光大银行成都高新支行",
      bankAccount: "51010012345678901234",
      isDefault: false,
      createTime: "2025-05-15 14:00:00"
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

