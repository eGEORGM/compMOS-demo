/**
 * 账单包模拟数据
 * 4个账单包，涵盖4种状态：待对账、已核对、开票中、已结清
 */

export const mockBills = [
  {
    billNo: "BILL202601001",
    billCycle: "2026-01",
    billStatus: 0, // 待对账
    totalAmount: 125350.5,
    totalOrderCount: 45,
    hotelAmount: 48200.0,
    hotelCount: 18,
    flightAmount: 62150.5,
    flightCount: 17,
    trainAmount: 15000.0,
    trainCount: 10,
    createTime: "2026-01-01T00:00:00Z",
    confirmTime: null,
    settleTime: null,
    companyName: "示例科技有限公司",
    accountType: 1 // 预存
  },
  {
    billNo: "BILL202512001",
    billCycle: "2025-12",
    billStatus: 1, // 已核对
    totalAmount: 89600.0,
    totalOrderCount: 32,
    hotelAmount: 35000.0,
    hotelCount: 15,
    flightAmount: 42300.0,
    flightCount: 12,
    trainAmount: 12300.0,
    trainCount: 5,
    createTime: "2025-12-01T00:00:00Z",
    confirmTime: "2025-12-05T14:30:00Z",
    settleTime: null,
    companyName: "示例科技有限公司",
    accountType: 1 // 预存
  },
  {
    billNo: "BILL202511001",
    billCycle: "2025-11",
    billStatus: 2, // 开票中
    totalAmount: 156800.0,
    totalOrderCount: 50,
    hotelAmount: 58000.0,
    hotelCount: 22,
    flightAmount: 78800.0,
    flightCount: 20,
    trainAmount: 20000.0,
    trainCount: 8,
    createTime: "2025-11-01T00:00:00Z",
    confirmTime: "2025-11-03T10:15:00Z",
    settleTime: null,
    companyName: "示例科技有限公司",
    accountType: 1 // 预存
  },
  {
    billNo: "BILL202510001",
    billCycle: "2025-10",
    billStatus: 3, // 已结清
    totalAmount: 102400.0,
    totalOrderCount: 38,
    hotelAmount: 42000.0,
    hotelCount: 16,
    flightAmount: 48400.0,
    flightCount: 15,
    trainAmount: 12000.0,
    trainCount: 7,
    createTime: "2025-10-01T00:00:00Z",
    confirmTime: "2025-10-04T09:20:00Z",
    settleTime: "2025-10-15T16:45:00Z",
    companyName: "示例科技有限公司",
    accountType: 1 // 预存
  }
];

// 导出获取账单包列表的方法
export function getBills() {
  return mockBills;
}

// 根据账单号获取账单
export function getBillByNo(billNo) {
  return mockBills.find((bill) => bill.billNo === billNo);
}

// 更新账单状态
export function updateBillStatus(billNo, status) {
  const bill = getBillByNo(billNo);
  if (bill) {
    bill.billStatus = status;
    if (status === 1) {
      // 已核对
      bill.confirmTime = new Date().toISOString();
    } else if (status === 3) {
      // 已结清
      bill.settleTime = new Date().toISOString();
    }
  }
  return bill;
}

