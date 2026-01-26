/**
 * 订单明细模拟数据
 * 150条订单，分布在4个账单包中
 */
import Mock from "mockjs";

// 生成业务信息
function generateBusinessInfo(businessType) {
  if (businessType === "002") {
    // 机票
    return Mock.mock({
      flightNo: /[A-Z]{2}\d{4}/,
      "departure|1": ["上海虹桥", "北京首都", "广州白云", "深圳宝安", "成都双流"],
      "destination|1": ["上海虹桥", "北京首都", "广州白云", "深圳宝安", "成都双流"],
      "cabin|1": ["经济舱", "商务舱"]
    });
  } else if (businessType === "003") {
    // 火车票
    return Mock.mock({
      trainNo: /[GD]\d{3,4}/,
      "departure|1": ["北京南", "上海虹桥", "广州南", "深圳北", "杭州东"],
      "destination|1": ["北京南", "上海虹桥", "广州南", "深圳北", "杭州东"],
      "seatType|1": ["一等座", "二等座", "商务座"]
    });
  } else {
    // 酒店
    return Mock.mock({
      "hotelName|1": [
        "如家酒店（上海徐家汇店）",
        "汉庭酒店（北京西单店）",
        "7天连锁（广州天河店）",
        "锦江之星（深圳福田店）"
      ],
      "checkInDate": "@date('yyyy-MM-dd')",
      "checkOutDate": "@date('yyyy-MM-dd')",
      "roomType|1": ["商务大床房", "标准双床房", "豪华套房"]
    });
  }
}

// 生成单个订单
function generateOrder(billNo, index, businessType, checkStatus = false) {
  const orderIndex = String(index).padStart(5, "0");
  const billPrefix = billNo.replace("BILL", "");

  return {
    orderNo: `ORDER${billPrefix}${orderIndex}`,
    businessType: businessType,
    travelerName: Mock.mock("@cname"),
    bookerName: "李四",
    payAmount:
      businessType === "002"
        ? Mock.Random.float(2000, 5000, 2, 2)
        : businessType === "003"
        ? Mock.Random.float(300, 800, 2, 2)
        : Mock.Random.float(500, 2000, 2, 2),
    payTime: Mock.mock("@datetime('yyyy-MM-ddTHH:mm:ssZ')"),
    travelTime: Mock.mock("@datetime('yyyy-MM-ddTHH:mm:ssZ')"),
    checkStatus: checkStatus,
    costCenter: Mock.Random.pick(["技术部", "销售部", "市场部", "行政部", "财务部"]),
    costUnderDep: Mock.Random.pick(["研发中心", "销售中心", "市场中心", "行政中心", "财务中心"]),
    invoiceTitle: "示例科技有限公司",
    productProvider:
      businessType === "002"
        ? Mock.Random.pick(["东方航空", "南方航空", "中国国航", "海南航空"])
        : businessType === "003"
        ? "中国铁路"
        : Mock.Random.pick(["如家酒店", "汉庭酒店", "7天连锁", "锦江之星"]),
    ticketNo:
      businessType === "002"
        ? `MU${Mock.Random.string("number", 9)}`
        : businessType === "003"
        ? `D${Mock.Random.string("number", 8)}`
        : `HTL${Mock.Random.date("yyyyMMdd")}${Mock.Random.string("number", 3)}`,
    businessInfo: generateBusinessInfo(businessType)
  };
}

// 生成账单的订单列表
function generateOrdersForBill(billNo, counts, checkStatus = false) {
  const orders = [];
  let index = 1;

  // 机票订单
  for (let i = 0; i < counts.flight; i++) {
    orders.push(generateOrder(billNo, index++, "002", checkStatus));
  }

  // 火车票订单
  for (let i = 0; i < counts.train; i++) {
    orders.push(generateOrder(billNo, index++, "003", checkStatus));
  }

  // 酒店订单
  for (let i = 0; i < counts.hotel; i++) {
    orders.push(generateOrder(billNo, index++, "001", checkStatus));
  }

  return orders;
}

// Mock订单数据
export const mockOrders = {
  // BILL202601001: 待对账，45条订单
  BILL202601001: generateOrdersForBill("BILL202601001", { flight: 17, train: 10, hotel: 18 }, false),

  // BILL202512001: 已核对，32条订单
  BILL202512001: generateOrdersForBill("BILL202512001", { flight: 12, train: 5, hotel: 15 }, true),

  // BILL202511001: 开票中，50条订单
  BILL202511001: generateOrdersForBill("BILL202511001", { flight: 20, train: 8, hotel: 22 }, true),

  // BILL202510001: 已结清，38条订单
  BILL202510001: generateOrdersForBill("BILL202510001", { flight: 15, train: 7, hotel: 16 }, true)
};

// 获取账单的订单列表
export function getOrdersByBillNo(billNo) {
  return mockOrders[billNo] || [];
}

// 更新订单核对状态
export function updateOrderCheckStatus(billNo, orderNo, checkStatus) {
  const orders = mockOrders[billNo];
  if (orders) {
    const order = orders.find((o) => o.orderNo === orderNo);
    if (order) {
      order.checkStatus = checkStatus;
      return true;
    }
  }
  return false;
}

// 批量更新订单核对状态
export function batchUpdateOrderCheckStatus(billNo, orderNos, checkStatus) {
  const orders = mockOrders[billNo];
  if (orders) {
    orderNos.forEach((orderNo) => {
      const order = orders.find((o) => o.orderNo === orderNo);
      if (order) {
        order.checkStatus = checkStatus;
      }
    });
    return true;
  }
  return false;
}

// 获取已核对订单数量
export function getCheckedOrderCount(billNo) {
  const orders = mockOrders[billNo] || [];
  return orders.filter((o) => o.checkStatus).length;
}

// 批量修改订单字段（调账功能）
export function batchUpdateOrderFields(billNo, orderNos, fields) {
  const orders = mockOrders[billNo];
  if (orders) {
    orderNos.forEach((orderNo) => {
      const order = orders.find((o) => o.orderNo === orderNo);
      if (order) {
        Object.assign(order, fields);
      }
    });
    return true;
  }
  return false;
}

