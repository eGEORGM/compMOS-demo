/**
 * 格式化工具函数
 * 金额、日期、百分比等数据格式化
 */
import moment from "moment";

/**
 * 格式化金额（带千分位和货币符号）
 * @param {Number} amount - 金额
 * @param {Number} decimals - 小数位数，默认2位
 * @param {String} symbol - 货币符号，默认¥
 * @returns {String} 格式化后的金额字符串
 */
export function formatAmount(amount, decimals = 2, symbol = "¥") {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return symbol + "0.00";
  }

  const num = Number(amount).toFixed(decimals);
  const parts = num.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimalPart = parts[1] ? "." + parts[1] : "";

  return symbol + integerPart + decimalPart;
}

/**
 * 格式化金额（不带货币符号）
 * @param {Number} amount - 金额
 * @param {Number} decimals - 小数位数，默认2位
 * @returns {String} 格式化后的金额字符串
 */
export function formatNumber(amount, decimals = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0.00";
  }

  const num = Number(amount).toFixed(decimals);
  const parts = num.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimalPart = parts[1] ? "." + parts[1] : "";

  return integerPart + decimalPart;
}

/**
 * 格式化日期
 * @param {String|Date|Number} date - 日期
 * @param {String} format - 格式，默认YYYY-MM-DD
 * @returns {String} 格式化后的日期字符串
 */
export function formatDate(date, format = "YYYY-MM-DD") {
  if (!date) return "-";
  return moment(date).format(format);
}

/**
 * 格式化日期时间
 * @param {String|Date|Number} datetime - 日期时间
 * @param {String} format - 格式，默认YYYY-MM-DD HH:mm:ss
 * @returns {String} 格式化后的日期时间字符串
 */
export function formatDateTime(datetime, format = "YYYY-MM-DD HH:mm:ss") {
  if (!datetime) return "-";
  return moment(datetime).format(format);
}

/**
 * 格式化时间
 * @param {String|Date|Number} time - 时间
 * @param {String} format - 格式，默认HH:mm:ss
 * @returns {String} 格式化后的时间字符串
 */
export function formatTime(time, format = "HH:mm:ss") {
  if (!time) return "-";
  return moment(time).format(format);
}

/**
 * 格式化相对时间（多久之前）
 * @param {String|Date|Number} date - 日期
 * @returns {String} 相对时间字符串
 */
export function formatRelativeTime(date) {
  if (!date) return "-";
  return moment(date).fromNow();
}

/**
 * 格式化百分比
 * @param {Number} value - 数值（0-1之间）
 * @param {Number} decimals - 小数位数，默认2位
 * @returns {String} 格式化后的百分比字符串
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0%";
  }

  return (Number(value) * 100).toFixed(decimals) + "%";
}

/**
 * 格式化文件大小
 * @param {Number} bytes - 字节数
 * @param {Number} decimals - 小数位数，默认2位
 * @returns {String} 格式化后的文件大小字符串
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  if (!bytes) return "-";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

/**
 * 格式化手机号（中间4位隐藏）
 * @param {String} phone - 手机号
 * @returns {String} 格式化后的手机号
 */
export function formatPhone(phone) {
  if (!phone) return "-";
  const phoneStr = String(phone);
  if (phoneStr.length === 11) {
    return phoneStr.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  }
  return phoneStr;
}

/**
 * 格式化身份证号（中间部分隐藏）
 * @param {String} idCard - 身份证号
 * @returns {String} 格式化后的身份证号
 */
export function formatIdCard(idCard) {
  if (!idCard) return "-";
  const idCardStr = String(idCard);
  if (idCardStr.length === 18) {
    return idCardStr.replace(/(\d{6})\d{8}(\d{4})/, "$1********$2");
  }
  return idCardStr;
}

/**
 * 格式化账单周期（2026-01 → 2026年1月）
 * @param {String} cycle - 账单周期 YYYY-MM
 * @param {Object} bill - 账单对象（可选，包含startDate和endDate）
 * @returns {String} 格式化后的账单周期
 */
export function formatBillCycle(cycle, bill) {
  if (!cycle) return "-";
  
  // 如果提供了账单对象且有开始和结束日期，显示具体时间跨度
  if (bill && bill.startDate && bill.endDate) {
    return formatDateRange(bill.startDate, bill.endDate);
  }
  
  // 否则只显示年月
  const [year, month] = cycle.split("-");
  return `${year}年${parseInt(month)}月`;
}

/**
 * 格式化账单编号（BILL202601001 → BILL-2026-01-001）
 * @param {String} billNo - 账单编号
 * @returns {String} 格式化后的账单编号
 */
export function formatBillNo(billNo) {
  if (!billNo) return "-";
  if (billNo.startsWith("BILL")) {
    const num = billNo.substring(4);
    if (num.length === 8) {
      return `BILL-${num.substring(0, 4)}-${num.substring(4, 6)}-${num.substring(6)}`;
    }
  }
  return billNo;
}

/**
 * 格式化订单编号（ORDER2026010100001 → ORDER-2026-01-01-00001）
 * @param {String} orderNo - 订单编号
 * @returns {String} 格式化后的订单编号
 */
export function formatOrderNo(orderNo) {
  if (!orderNo) return "-";
  if (orderNo.startsWith("ORDER")) {
    const num = orderNo.substring(5);
    if (num.length === 10) {
      return `ORDER-${num.substring(0, 4)}-${num.substring(4, 6)}-${num.substring(6, 8)}-${num.substring(8)}`;
    }
  }
  return orderNo;
}

/**
 * 截取字符串并添加省略号
 * @param {String} str - 字符串
 * @param {Number} length - 最大长度
 * @returns {String} 截取后的字符串
 */
export function ellipsis(str, length = 20) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

/**
 * 格式化空值（null/undefined/'' → '-'）
 * @param {Any} value - 值
 * @param {String} placeholder - 占位符，默认'-'
 * @returns {String} 格式化后的值
 */
export function formatEmpty(value, placeholder = "-") {
  if (value === null || value === undefined || value === "") {
    return placeholder;
  }
  return value;
}

/**
 * 格式化税号（每4位一个空格）
 * @param {String} taxNumber - 税号
 * @returns {String} 格式化后的税号
 */
export function formatTaxNumber(taxNumber) {
  if (!taxNumber) return "-";
  const cleaned = String(taxNumber).replace(/\s/g, "");
  return cleaned.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * 格式化银行账号（每4位一个空格）
 * @param {String} account - 银行账号
 * @returns {String} 格式化后的银行账号
 */
export function formatBankAccount(account) {
  if (!account) return "-";
  const cleaned = String(account).replace(/\s/g, "");
  return cleaned.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * 格式化结算周期范围（2026-01 ~ 2026-03 → 2026年1月 至 2026年3月）
 * @param {String} startCycle - 开始周期 YYYY-MM
 * @param {String} endCycle - 结束周期 YYYY-MM
 * @returns {String} 格式化后的周期范围
 */
export function formatCycleRange(startCycle, endCycle) {
  if (!startCycle || !endCycle) return "-";
  const start = formatBillCycle(startCycle);
  const end = formatBillCycle(endCycle);
  return `${start} 至 ${end}`;
}

/**
 * 格式化日期范围（2026-01-01 ~ 2026-01-31 → 2026年1月1日 至 2026年1月31日）
 * @param {String|Date} startDate - 开始日期
 * @param {String|Date} endDate - 结束日期
 * @returns {String} 格式化后的日期范围
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "-";
  const start = formatDate(startDate, "YYYY年M月D日");
  const end = formatDate(endDate, "YYYY年M月D日");
  return `${start} 至 ${end}`;
}

/**
 * 格式化金额差异（带正负号）
 * @param {Number} amount - 金额
 * @param {Number} decimals - 小数位数，默认2位
 * @returns {String} 格式化后的金额字符串
 */
export function formatAmountDiff(amount, decimals = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "¥0.00";
  }
  
  const num = Number(amount);
  const prefix = num > 0 ? "+" : "";
  return prefix + formatAmount(num, decimals);
}

/**
 * 格式化数量（带单位）
 * @param {Number} count - 数量
 * @param {String} unit - 单位，默认"个"
 * @returns {String} 格式化后的数量字符串
 */
export function formatCount(count, unit = "个") {
  if (count === null || count === undefined || isNaN(count)) {
    return `0${unit}`;
  }
  return `${formatNumber(count, 0)}${unit}`;
}

/**
 * 格式化发票摘要（根据拆分维度生成）
 * @param {Object} data - 数据对象
 * @param {Array} dimensions - 拆分维度
 * @returns {String} 发票摘要
 */
export function formatInvoiceSummary(data, dimensions) {
  if (!data || !dimensions || dimensions.length === 0) {
    return "全部订单";
  }
  
  const parts = [];
  const dimensionMap = {
    businessLine: data.businessLineName || data.businessLine,
    legalEntity: data.legalEntity,
    paymentAccount: data.paymentAccount,
    department: data.department
  };
  
  dimensions.forEach(dim => {
    if (dimensionMap[dim]) {
      parts.push(dimensionMap[dim]);
    }
  });
  
  return parts.join(" - ") || "全部订单";
}

/**
 * 格式化枚举值（根据映射表获取显示名称）
 * @param {Any} value - 枚举值
 * @param {Object} map - 映射表
 * @param {String} defaultValue - 默认值
 * @returns {String} 显示名称
 */
export function formatEnum(value, map, defaultValue = "-") {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return map[value] || defaultValue;
}

/**
 * 格式化布尔值（true → '是', false → '否'）
 * @param {Boolean} value - 布尔值
 * @returns {String} 格式化后的字符串
 */
export function formatBoolean(value) {
  if (value === null || value === undefined) {
    return "-";
  }
  return value ? "是" : "否";
}

/**
 * 格式化订单搜索关键词（支持多个订单号）
 * @param {String} keywords - 搜索关键词（逗号或换行分隔）
 * @returns {Array} 订单号数组
 */
export function parseOrderSearchKeywords(keywords) {
  if (!keywords) return [];
  
  // 移除所有空白字符并按逗号或换行分隔
  const cleaned = keywords.replace(/\s+/g, "");
  const parts = cleaned.split(/[,，\n]+/);
  
  // 过滤空字符串
  return parts.filter(p => p.length > 0);
}

/**
 * 格式化文件名（用于导出）
 * @param {String} prefix - 前缀
 * @param {String} billNo - 账单号（可选）
 * @param {String} extension - 文件扩展名
 * @returns {String} 文件名
 */
export function formatExportFilename(prefix, billNo, extension) {
  const timestamp = moment().format("YYYYMMDDHHmmss");
  if (billNo) {
    return `${prefix}_${billNo}_${timestamp}.${extension}`;
  }
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * 下载文件（Blob）
 * @param {Blob} blob - 文件Blob对象
 * @param {String} filename - 文件名
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 深度克隆对象
 * @param {Object} obj - 要克隆的对象
 * @returns {Object} 克隆后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, delay = 300) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

