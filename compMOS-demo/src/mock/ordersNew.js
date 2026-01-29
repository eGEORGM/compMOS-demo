/**
 * 订单明细Mock数据（重构版）
 */

import Mock from "mockjs";
import {
  BUSINESS_TYPE,
  CHECK_STATUS,
  LEGAL_ENTITY_OPTIONS,
  PAYMENT_ACCOUNT_OPTIONS,
  DEPARTMENT_OPTIONS,
  COST_CENTER_OPTIONS,
  PROJECT_OPTIONS
} from "@/utils/constants";

/**
 * 生成机票订单
 */
function generateFlightOrder(billNo, index) {
  const travelerNames = ["张三", "李四", "王五", "赵六", "孙七"];
  const routes = [
    { from: "北京", to: "上海", code: "PEK-SHA" },
    { from: "深圳", to: "广州", code: "SZX-CAN" },
    { from: "杭州", to: "成都", code: "HGH-CTU" },
    { from: "武汉", to: "西安", code: "WUH-XIY" }
  ];
  const route = routes[index % routes.length];

  return {
    orderNo: `ORDER${Mock.Random.date("yyyyMMdd")}${String(index).padStart(5, "0")}`,
    billNo,
    businessType: BUSINESS_TYPE.FLIGHT,
    businessTypeName: "机票",
    travelerName: travelerNames[index % travelerNames.length],
    departDate: Mock.Random.date("yyyy-MM-dd"),
    returnDate: null,
    route: `${route.from}-${route.to}`,
    routeCode: route.code,
    flightNo: `CA${Mock.Random.integer(1000, 9999)}`,
    cabin: Mock.Random.pick(["经济舱", "商务舱"]),
    amount: Mock.Random.float(800, 3000, 2, 2),
    payAmount: Mock.Random.float(800, 3000, 2, 2),
    legalEntity: LEGAL_ENTITY_OPTIONS[index % LEGAL_ENTITY_OPTIONS.length],
    department: DEPARTMENT_OPTIONS[index % DEPARTMENT_OPTIONS.length],
    project: PROJECT_OPTIONS[index % PROJECT_OPTIONS.length],
    paymentAccount: PAYMENT_ACCOUNT_OPTIONS[index % PAYMENT_ACCOUNT_OPTIONS.length],
    costCenter: COST_CENTER_OPTIONS[index % COST_CENTER_OPTIONS.length],
    checkStatus: CHECK_STATUS.UNCHECKED,
    bookingPerson: "预订员" + (index % 3 + 1),
    bookingTime: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    invoiceTitle: "示例科技有限公司",
    invoiceType: Mock.Random.pick([1, 3]), // 普票或行程单
    remark: ""
  };
}

/**
 * 生成酒店订单
 */
function generateHotelOrder(billNo, index) {
  const travelerNames = ["张三", "李四", "王五", "赵六", "孙七"];
  const hotels = [
    "北京希尔顿酒店",
    "上海锦江酒店",
    "深圳富士康酒店",
    "杭州西湖宾馆"
  ];

  return {
    orderNo: `ORDER${Mock.Random.date("yyyyMMdd")}${String(index + 1000).padStart(5, "0")}`,
    billNo,
    businessType: BUSINESS_TYPE.HOTEL,
    businessTypeName: "酒店",
    travelerName: travelerNames[index % travelerNames.length],
    hotelName: hotels[index % hotels.length],
    city: Mock.Random.city(),
    checkInDate: Mock.Random.date("yyyy-MM-dd"),
    checkOutDate: Mock.Random.date("yyyy-MM-dd"),
    nights: Mock.Random.integer(1, 5),
    roomType: Mock.Random.pick(["标准间", "大床房", "商务套房"]),
    amount: Mock.Random.float(300, 1500, 2, 2),
    payAmount: Mock.Random.float(300, 1500, 2, 2),
    legalEntity: LEGAL_ENTITY_OPTIONS[index % LEGAL_ENTITY_OPTIONS.length],
    department: DEPARTMENT_OPTIONS[index % DEPARTMENT_OPTIONS.length],
    project: PROJECT_OPTIONS[index % PROJECT_OPTIONS.length],
    paymentAccount: PAYMENT_ACCOUNT_OPTIONS[index % PAYMENT_ACCOUNT_OPTIONS.length],
    costCenter: COST_CENTER_OPTIONS[index % COST_CENTER_OPTIONS.length],
    checkStatus: CHECK_STATUS.UNCHECKED,
    bookingPerson: "预订员" + (index % 3 + 1),
    bookingTime: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    invoiceTitle: "示例科技有限公司",
    invoiceType: Mock.Random.pick([1, 2]), // 普票或专票
    remark: ""
  };
}

/**
 * 生成火车票订单
 */
function generateTrainOrder(billNo, index) {
  const travelerNames = ["张三", "李四", "王五", "赵六", "孙七"];
  const routes = [
    { from: "北京", to: "上海" },
    { from: "深圳", to: "广州" },
    { from: "杭州", to: "成都" },
    { from: "武汉", to: "西安" }
  ];
  const route = routes[index % routes.length];

  return {
    orderNo: `ORDER${Mock.Random.date("yyyyMMdd")}${String(index + 2000).padStart(5, "0")}`,
    billNo,
    businessType: BUSINESS_TYPE.TRAIN,
    businessTypeName: "火车票",
    travelerName: travelerNames[index % travelerNames.length],
    departDate: Mock.Random.date("yyyy-MM-dd"),
    route: `${route.from}-${route.to}`,
    trainNo: `G${Mock.Random.integer(100, 999)}`,
    seatType: Mock.Random.pick(["二等座", "一等座", "商务座"]),
    amount: Mock.Random.float(200, 800, 2, 2),
    payAmount: Mock.Random.float(200, 800, 2, 2),
    legalEntity: LEGAL_ENTITY_OPTIONS[index % LEGAL_ENTITY_OPTIONS.length],
    department: DEPARTMENT_OPTIONS[index % DEPARTMENT_OPTIONS.length],
    project: PROJECT_OPTIONS[index % PROJECT_OPTIONS.length],
    paymentAccount: PAYMENT_ACCOUNT_OPTIONS[index % PAYMENT_ACCOUNT_OPTIONS.length],
    costCenter: COST_CENTER_OPTIONS[index % COST_CENTER_OPTIONS.length],
    checkStatus: CHECK_STATUS.UNCHECKED,
    bookingPerson: "预订员" + (index % 3 + 1),
    bookingTime: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    invoiceTitle: "示例科技有限公司",
    invoiceType: 4, // 火车票行程单
    remark: ""
  };
}

/**
 * 生成账单的订单列表
 * @param {String} billNo - 账单号
 * @param {Object} businessCounts - 各业务线订单数量
 */
export function generateBillOrders(billNo, businessCounts = { flight: 25, hotel: 15, train: 5 }) {
  const orders = [];

  // 生成机票订单
  for (let i = 0; i < businessCounts.flight; i++) {
    orders.push(generateFlightOrder(billNo, i));
  }

  // 生成酒店订单
  for (let i = 0; i < businessCounts.hotel; i++) {
    orders.push(generateHotelOrder(billNo, i));
  }

  // 生成火车票订单
  for (let i = 0; i < businessCounts.train; i++) {
    orders.push(generateTrainOrder(billNo, i));
  }

  return orders;
}

/**
 * 筛选订单
 * @param {Array} orders - 订单列表
 * @param {Object} filters - 筛选条件
 */
export function filterOrders(orders, filters) {
  let filtered = [...orders];

  // 按业务类型筛选
  if (filters.businessType) {
    filtered = filtered.filter(o => o.businessType === filters.businessType);
  }

  // 按核对状态筛选
  if (filters.checkStatus !== undefined && filters.checkStatus !== null) {
    filtered = filtered.filter(o => o.checkStatus === filters.checkStatus);
  }

  // 按出行人姓名筛选
  if (filters.travelerName) {
    filtered = filtered.filter(o =>
      o.travelerName.includes(filters.travelerName)
    );
  }

  // 按法人实体筛选
  if (filters.legalEntity) {
    filtered = filtered.filter(o => o.legalEntity === filters.legalEntity);
  }

  // 按项目筛选
  if (filters.project) {
    filtered = filtered.filter(o => o.project === filters.project);
  }

  // 按订单号批量查询
  if (filters.orderNos && filters.orderNos.length > 0) {
    filtered = filtered.filter(o => filters.orderNos.includes(o.orderNo));
  }

  return filtered;
}

/**
 * 更新订单核对状态
 * @param {Array} orders - 订单列表
 * @param {Array} orderNos - 订单号列表
 * @param {Number} checkStatus - 核对状态
 */
export function updateOrderCheckStatus(orders, orderNos, checkStatus) {
  orders.forEach(order => {
    if (orderNos.includes(order.orderNo)) {
      order.checkStatus = checkStatus;
    }
  });
  return orders;
}

/**
 * 批量更新订单字段
 * @param {Array} orders - 订单列表
 * @param {Array} updates - 更新数据 [{orderNo, field, value}]
 */
export function batchUpdateOrders(orders, updates) {
  const updateMap = new Map();
  updates.forEach(update => {
    if (!updateMap.has(update.orderNo)) {
      updateMap.set(update.orderNo, {});
    }
    updateMap.get(update.orderNo)[update.field] = update.value;
  });

  orders.forEach(order => {
    if (updateMap.has(order.orderNo)) {
      Object.assign(order, updateMap.get(order.orderNo));
    }
  });

  return orders;
}

export default {
  generateBillOrders,
  filterOrders,
  updateOrderCheckStatus,
  batchUpdateOrders
};

