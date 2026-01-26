/**
 * Excel导出工具
 * 使用xlsx库实现Excel文件的生成和导出
 * 
 * 注意：需要先安装xlsx库
 * npm install xlsx --save
 */

import { formatDate, formatAmount } from "./format";
import { BUSINESS_TYPE_NAMES, CHECK_STATUS_NAMES } from "./constants";

/**
 * 检查xlsx库是否已安装
 */
function checkXlsxAvailable() {
  try {
    require("xlsx");
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 获取字段的显示名称
 */
const fieldLabels = {
  orderNo: "订单号",
  bookingTime: "预订日期",
  departDate: "出行日期",
  bookingPerson: "预订人",
  travelerName: "出行人/入住人",
  amount: "支付金额",
  checkStatus: "核对状态",
  
  // 机票特有字段
  flightNo: "航班号",
  route: "航线",
  departTime: "起飞时间",
  cabin: "舱位等级",
  ticketNo: "电子客票号",
  
  // 酒店特有字段
  hotelName: "酒店名称",
  checkInDate: "入住日期",
  checkOutDate: "离店日期",
  nights: "房间数量",
  roomType: "房型",
  
  // 火车票特有字段
  trainNo: "车次",
  seatType: "座位等级",
  idCardLast4: "身份证后四位",
  
  // 用车特有字段
  useTime: "用车时间",
  startLocation: "起点",
  endLocation: "终点",
  carType: "车型",
  mileage: "行驶里程",
  
  // 财务字段
  legalEntity: "法人实体",
  paymentAccount: "支付账户",
  costCenter: "成本中心",
  department: "项目部门",
  expenseType: "费用类型"
};

/**
 * 格式化字段值
 */
function formatFieldValue(field, value, row) {
  if (value === null || value === undefined) {
    return "";
  }
  
  switch (field) {
    case "bookingTime":
    case "departTime":
    case "useTime":
      return formatDate(value, "YYYY-MM-DD HH:mm");
    
    case "departDate":
    case "checkInDate":
    case "checkOutDate":
      return formatDate(value, "YYYY-MM-DD");
    
    case "amount":
      return formatAmount(value);
    
    case "checkStatus":
      return CHECK_STATUS_NAMES[value] || value;
    
    case "businessType":
      return BUSINESS_TYPE_NAMES[value] || value;
    
    default:
      return value;
  }
}

/**
 * 导出数据到Excel
 * @param {Object} options 导出选项
 * @param {Array} options.data 要导出的数据数组
 * @param {Array} options.fields 要导出的字段列表
 * @param {String} options.fileName 文件名（不含扩展名）
 * @param {String} options.sheetName 工作表名称
 */
export function exportToExcel(options) {
  const {
    data = [],
    fields = [],
    fileName = "导出数据",
    sheetName = "Sheet1"
  } = options;
  
  // 检查xlsx库是否可用
  if (!checkXlsxAvailable()) {
    throw new Error(
      "Excel导出功能需要安装xlsx库。\n" +
      "请运行以下命令安装：\n" +
      "npm install xlsx --save"
    );
  }
  
  // 动态导入xlsx
  const XLSX = require("xlsx");
  
  // 验证参数
  if (!data || data.length === 0) {
    throw new Error("没有可导出的数据");
  }
  
  if (!fields || fields.length === 0) {
    throw new Error("请先配置导出字段");
  }
  
  // 构建表头
  const headers = fields.map(field => fieldLabels[field] || field);
  
  // 构建数据行
  const rows = data.map(row => {
    return fields.map(field => formatFieldValue(field, row[field], row));
  });
  
  // 合并表头和数据
  const sheetData = [headers, ...rows];
  
  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // 设置列宽
  const columnWidths = fields.map(field => {
    const label = fieldLabels[field] || field;
    // 根据字段类型和标题长度设置列宽
    const baseWidth = Math.max(label.length * 2, 10);
    
    // 特殊字段的宽度调整
    if (field === "orderNo") return { wch: 20 };
    if (field === "bookingTime" || field === "departTime") return { wch: 18 };
    if (field === "amount") return { wch: 12 };
    if (field === "route") return { wch: 20 };
    if (field === "hotelName") return { wch: 25 };
    
    return { wch: baseWidth };
  });
  
  worksheet["!cols"] = columnWidths;
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // 导出文件
  const timestamp = formatDate(new Date(), "YYYYMMDD_HHmmss");
  const fullFileName = `${fileName}_${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, fullFileName);
  
  return {
    fileName: fullFileName,
    rowCount: data.length,
    fieldCount: fields.length
  };
}

/**
 * 导出账单订单到Excel
 * @param {Object} options 导出选项
 * @param {Array} options.orders 订单数据
 * @param {Array} options.fields 导出字段
 * @param {String} options.businessType 业务类型
 * @param {String} options.billNo 账单号
 */
export function exportBillOrders(options) {
  const {
    orders = [],
    fields = [],
    businessType = "",
    billNo = ""
  } = options;
  
  const businessTypeName = BUSINESS_TYPE_NAMES[businessType] || "订单";
  const fileName = `账单${billNo}_${businessTypeName}明细`;
  const sheetName = businessTypeName;
  
  return exportToExcel({
    data: orders,
    fields,
    fileName,
    sheetName
  });
}

/**
 * 批量导出多个业务线的订单
 * @param {Object} options 导出选项
 * @param {Object} options.ordersByType 按业务类型分组的订单对象 { '001': [...], '002': [...] }
 * @param {Array} options.fields 导出字段
 * @param {String} options.billNo 账单号
 */
export function exportBillOrdersMultiSheet(options) {
  const {
    ordersByType = {},
    fields = [],
    billNo = ""
  } = options;
  
  // 检查xlsx库是否可用
  if (!checkXlsxAvailable()) {
    throw new Error(
      "Excel导出功能需要安装xlsx库。\n" +
      "请运行以下命令安装：\n" +
      "npm install xlsx --save"
    );
  }
  
  const XLSX = require("xlsx");
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 为每个业务类型创建工作表
  Object.keys(ordersByType).forEach(businessType => {
    const orders = ordersByType[businessType];
    if (!orders || orders.length === 0) return;
    
    const businessTypeName = BUSINESS_TYPE_NAMES[businessType] || businessType;
    
    // 构建表头
    const headers = fields.map(field => fieldLabels[field] || field);
    
    // 构建数据行
    const rows = orders.map(row => {
      return fields.map(field => formatFieldValue(field, row[field], row));
    });
    
    // 合并表头和数据
    const sheetData = [headers, ...rows];
    
    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    
    // 设置列宽
    const columnWidths = fields.map(field => {
      const label = fieldLabels[field] || field;
      const baseWidth = Math.max(label.length * 2, 10);
      
      if (field === "orderNo") return { wch: 20 };
      if (field === "bookingTime" || field === "departTime") return { wch: 18 };
      if (field === "amount") return { wch: 12 };
      
      return { wch: baseWidth };
    });
    
    worksheet["!cols"] = columnWidths;
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, businessTypeName);
  });
  
  // 导出文件
  const timestamp = formatDate(new Date(), "YYYYMMDD_HHmmss");
  const fullFileName = `账单${billNo}_全部明细_${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, fullFileName);
  
  return {
    fileName: fullFileName,
    sheetCount: Object.keys(ordersByType).length
  };
}

export default {
  exportToExcel,
  exportBillOrders,
  exportBillOrdersMultiSheet
};

