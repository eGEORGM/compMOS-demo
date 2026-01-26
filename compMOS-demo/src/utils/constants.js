/**
 * 常量和枚举定义
 */

// 账单状态
export const BILL_STATUS = {
  PENDING_CONFIRM: 0, // 待确认（完成账单打包）
  ADJUSTING: 1, // 调账中（有账单申请调账后台待审核）
  PENDING_INVOICE: 2, // 待开票（账单已确认待开票）
  INVOICING: 3, // 开票中（已提交开票申请，等待开票完成）
  PENDING_PAYMENT: 4, // 待付款（账单已全部交付开票）
  SETTLED: 5 // 已结清（账单已还清/充值）
};

// 账单状态名称映射
export const BILL_STATUS_NAMES = {
  [BILL_STATUS.PENDING_CONFIRM]: "待确认",
  [BILL_STATUS.ADJUSTING]: "调账中",
  [BILL_STATUS.PENDING_INVOICE]: "待开票",
  [BILL_STATUS.INVOICING]: "开票中",
  [BILL_STATUS.PENDING_PAYMENT]: "待付款",
  [BILL_STATUS.SETTLED]: "已结清"
};

// 账单状态颜色映射（Element UI标签类型）
export const BILL_STATUS_COLORS = {
  [BILL_STATUS.PENDING_CONFIRM]: "warning", // 橙色
  [BILL_STATUS.ADJUSTING]: "danger", // 红色
  [BILL_STATUS.PENDING_INVOICE]: "", // 默认色
  [BILL_STATUS.INVOICING]: "primary", // 蓝色
  [BILL_STATUS.PENDING_PAYMENT]: "info", // 灰蓝色
  [BILL_STATUS.SETTLED]: "success" // 绿色
};

// 业务类型
export const BUSINESS_TYPE = {
  FLIGHT: "001", // 机票
  HOTEL: "002", // 酒店
  TRAIN: "003", // 火车票
  CAR: "004" // 用车
};

// 业务类型名称映射
export const BUSINESS_TYPE_NAMES = {
  [BUSINESS_TYPE.FLIGHT]: "机票",
  [BUSINESS_TYPE.HOTEL]: "酒店",
  [BUSINESS_TYPE.TRAIN]: "火车票",
  [BUSINESS_TYPE.CAR]: "用车"
};

// 业务类型颜色映射
export const BUSINESS_TYPE_COLORS = {
  [BUSINESS_TYPE.FLIGHT]: "#67c23a", // 绿色
  [BUSINESS_TYPE.HOTEL]: "#409eff", // 蓝色
  [BUSINESS_TYPE.TRAIN]: "#e6a23c", // 橙色
  [BUSINESS_TYPE.CAR]: "#909399" // 灰色
};

// 发票类型
export const INVOICE_TYPE = {
  GENERAL: 1, // 增值税普通发票
  SPECIAL: 2, // 增值税专用发票
  FLIGHT_ITINERARY: 3, // 机票电子行程单
  TRAIN_ITINERARY: 4 // 火车票电子行程单
};

// 发票类型名称映射
export const INVOICE_TYPE_NAMES = {
  [INVOICE_TYPE.GENERAL]: "增值税普票",
  [INVOICE_TYPE.SPECIAL]: "增值税专票",
  [INVOICE_TYPE.FLIGHT_ITINERARY]: "机票电子行程单",
  [INVOICE_TYPE.TRAIN_ITINERARY]: "火车票电子行程单"
};

// 发票类型缩写
export const INVOICE_TYPE_SHORT_NAMES = {
  [INVOICE_TYPE.GENERAL]: "普票",
  [INVOICE_TYPE.SPECIAL]: "专票",
  [INVOICE_TYPE.FLIGHT_ITINERARY]: "机票行程单",
  [INVOICE_TYPE.TRAIN_ITINERARY]: "火车票行程单"
};

// 发票类型颜色映射
export const INVOICE_TYPE_COLORS = {
  [INVOICE_TYPE.GENERAL]: "#67c23a", // 绿色
  [INVOICE_TYPE.SPECIAL]: "#409eff", // 蓝色
  [INVOICE_TYPE.FLIGHT_ITINERARY]: "#9b59b6", // 紫色
  [INVOICE_TYPE.TRAIN_ITINERARY]: "#e6a23c" // 橙色
};

// 发票状态
export const INVOICE_STATUS = {
  ISSUED: 1, // 已开具
  RED_FLUSHED: 2, // 已红冲
  CANCELLED: 3 // 已作废
};

// 发票状态名称映射
export const INVOICE_STATUS_NAMES = {
  [INVOICE_STATUS.ISSUED]: "已开具",
  [INVOICE_STATUS.RED_FLUSHED]: "已红冲",
  [INVOICE_STATUS.CANCELLED]: "已作废"
};

// 发票状态颜色映射
export const INVOICE_STATUS_COLORS = {
  [INVOICE_STATUS.ISSUED]: "success", // 绿色
  [INVOICE_STATUS.RED_FLUSHED]: "warning", // 橙色
  [INVOICE_STATUS.CANCELLED]: "info" // 灰色
};

// 批次状态
export const BATCH_STATUS = {
  IN_PROGRESS: 0, // 开票中
  COMPLETED: 1, // 已完成
  PARTIALLY_FAILED: 2 // 部分失败
};

// 批次状态名称映射
export const BATCH_STATUS_NAMES = {
  [BATCH_STATUS.IN_PROGRESS]: "开票中",
  [BATCH_STATUS.COMPLETED]: "已完成",
  [BATCH_STATUS.PARTIALLY_FAILED]: "部分失败"
};

// 账户类型
export const ACCOUNT_TYPE = {
  PREPAID: 1, // 预存企业
  CREDIT: 2 // 授信企业
};

// 账户类型名称映射
export const ACCOUNT_TYPE_NAMES = {
  [ACCOUNT_TYPE.PREPAID]: "预存企业",
  [ACCOUNT_TYPE.CREDIT]: "授信企业"
};

// 成本中心选项
export const COST_CENTER_OPTIONS = ["技术部", "销售部", "市场部", "行政部", "财务部", "人力资源部"];

// 成本归属部门选项
export const COST_UNDER_DEP_OPTIONS = [
  "研发中心",
  "销售中心",
  "市场中心",
  "行政中心",
  "财务中心",
  "人力资源中心"
];

// 发票抬头选项（预设）
export const INVOICE_TITLE_OPTIONS = ["示例科技有限公司", "示例贸易有限公司"];

// LocalStorage键名
export const STORAGE_KEYS = {
  USER_TYPE: "demo_user_type", // 当前用户类型
  MOCK_DATA_VERSION: "demo_mock_data_version" // Mock数据版本
};

// 分页配置
export const PAGINATION = {
  PAGE_SIZES: [10, 20, 50, 100],
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 1
};

// 日期格式
export const DATE_FORMAT = {
  DATE: "YYYY-MM-DD",
  DATETIME: "YYYY-MM-DD HH:mm:ss",
  TIME: "HH:mm:ss",
  MONTH: "YYYY-MM",
  YEAR: "YYYY"
};

// 导出配置
export const EXPORT_CONFIG = {
  MAX_ROWS: 10000, // 最大导出行数
  SHEET_NAMES: {
    FLIGHT: "机票订单",
    HOTEL: "酒店订单",
    TRAIN: "火车票订单",
    CAR: "用车订单"
  }
};

// 核对状态
export const CHECK_STATUS = {
  UNCHECKED: 0, // 未核对
  CHECKED: 1, // 已核对
  ABNORMAL: 2 // 异常
};

// 核对状态名称映射
export const CHECK_STATUS_NAMES = {
  [CHECK_STATUS.UNCHECKED]: "未核对",
  [CHECK_STATUS.CHECKED]: "已核对",
  [CHECK_STATUS.ABNORMAL]: "异常"
};

// 核对状态颜色映射
export const CHECK_STATUS_COLORS = {
  [CHECK_STATUS.UNCHECKED]: "info",
  [CHECK_STATUS.CHECKED]: "success",
  [CHECK_STATUS.ABNORMAL]: "danger"
};

// 拆分维度
export const SPLIT_DIMENSION = {
  BUSINESS_LINE: "businessLine", // 业务线
  LEGAL_ENTITY: "legalEntity", // 法人实体
  PAYMENT_ACCOUNT: "paymentAccount", // 支付账户
  DEPARTMENT: "department" // 部门
};

// 拆分维度名称映射
export const SPLIT_DIMENSION_NAMES = {
  [SPLIT_DIMENSION.BUSINESS_LINE]: "业务线",
  [SPLIT_DIMENSION.LEGAL_ENTITY]: "法人实体",
  [SPLIT_DIMENSION.PAYMENT_ACCOUNT]: "支付账户",
  [SPLIT_DIMENSION.DEPARTMENT]: "部门"
};

// 拆分维度选项列表
export const SPLIT_DIMENSION_OPTIONS = [
  { value: SPLIT_DIMENSION.BUSINESS_LINE, label: "业务线" },
  { value: SPLIT_DIMENSION.LEGAL_ENTITY, label: "法人实体" },
  { value: SPLIT_DIMENSION.PAYMENT_ACCOUNT, label: "支付账户" },
  { value: SPLIT_DIMENSION.DEPARTMENT, label: "部门" }
];

// 法人实体选项
export const LEGAL_ENTITY_OPTIONS = [
  "北京示例科技有限公司",
  "上海示例贸易有限公司",
  "深圳示例科技有限公司",
  "广州示例服务有限公司"
];

// 支付账户选项
export const PAYMENT_ACCOUNT_OPTIONS = [
  "公司主账户",
  "销售部账户",
  "市场部账户"
];

// 部门选项
export const DEPARTMENT_OPTIONS = [
  "技术部",
  "销售部",
  "市场部",
  "行政部",
  "财务部",
  "人力资源部",
  "运营部",
  "客服部"
];

// 项目选项
export const PROJECT_OPTIONS = [
  "项目A - 企业出行管理系统",
  "项目B - 商旅预订平台",
  "项目C - 差旅费用管理",
  "项目D - 企业级ERP系统",
  "项目E - 移动端APP开发",
  "项目F - 数据分析平台",
  "日常运营",
  "市场推广",
  "研发创新"
];

// 字段配置分类
export const FIELD_CONFIG_TYPE = {
  DISPLAY: "display", // 显示字段
  EXCEL_EXPORT: "excelExport", // Excel导出字段
  PDF_EXPORT: "pdfExport" // PDF导出字段
};

// 字段配置类型名称
export const FIELD_CONFIG_TYPE_NAMES = {
  [FIELD_CONFIG_TYPE.DISPLAY]: "显示字段",
  [FIELD_CONFIG_TYPE.EXCEL_EXPORT]: "Excel导出字段",
  [FIELD_CONFIG_TYPE.PDF_EXPORT]: "PDF导出字段"
};

// PDF字段最大数量限制
export const PDF_FIELD_MAX_COUNT = 20;

// 日期范围最大天数限制
export const DATE_RANGE_MAX_DAYS = 180;

// 默认日期范围（最近一个月）
export const DEFAULT_DATE_RANGE_DAYS = 30;

// 开票申请状态
export const INVOICE_APPLICATION_STATUS = {
  PENDING: 0, // 申请中
  SUCCESS: 1, // 成功
  FAILED: 2 // 失败
};

// 开票申请状态名称映射
export const INVOICE_APPLICATION_STATUS_NAMES = {
  [INVOICE_APPLICATION_STATUS.PENDING]: "申请中",
  [INVOICE_APPLICATION_STATUS.SUCCESS]: "成功",
  [INVOICE_APPLICATION_STATUS.FAILED]: "失败"
};

// 开票申请状态颜色映射
export const INVOICE_APPLICATION_STATUS_COLORS = {
  [INVOICE_APPLICATION_STATUS.PENDING]: "warning",
  [INVOICE_APPLICATION_STATUS.SUCCESS]: "success",
  [INVOICE_APPLICATION_STATUS.FAILED]: "danger"
};

